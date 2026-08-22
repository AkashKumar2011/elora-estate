const User = require('../models/User');
const Property = require('../models/Property');
const Lead = require('../models/Lead');
const Visit = require('../models/Visit');
const FollowUp = require('../models/FollowUp');
const Lineup = require('../models/Lineup');
const CartItem = require('../models/CartItem');
const Requirement = require('../models/Requirement');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');
const { matchPropertiesForRequirement } = require('../services/matchingService');
const {
  ROLES,
  PROPERTY_STATUS,
  LEAD_STAGE,
  FOLLOW_UP_STATUS,
  VISIT_STATUS,
} = require('../config/constants');

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

// ── Admin: "What is happening across my business?" ────────────────────
const getAdminDashboard = asyncHandler(async (req, res) => {
  const [
    totalClients,
    totalBrokers,
    totalProperties,
    activeLeads,
    pendingFollowUps,
    overdueFollowUps,
    todaysVisits,
    upcomingVisits,
    recentProperties,
    recentActivity,
  ] = await Promise.all([
    User.countDocuments({ role: ROLES.CLIENT }),
    User.countDocuments({ role: ROLES.BROKER }),
    Property.countDocuments({}),
    Lead.countDocuments({ stage: { $ne: LEAD_STAGE.DEAL_CLOSED }, outcome: { $exists: false } }),
    FollowUp.countDocuments({ status: FOLLOW_UP_STATUS.PENDING, dueAt: { $gte: startOfToday(), $lte: endOfToday() } }),
    FollowUp.countDocuments({ status: FOLLOW_UP_STATUS.PENDING, dueAt: { $lt: startOfToday() } }),
    Visit.find({ scheduledAt: { $gte: startOfToday(), $lte: endOfToday() }, status: { $in: [VISIT_STATUS.SCHEDULED, VISIT_STATUS.RESCHEDULED] } })
      .populate('client property broker', 'name mobile public propertyType')
      .sort({ scheduledAt: 1 }),
    Visit.find({ scheduledAt: { $gt: endOfToday() }, status: { $in: [VISIT_STATUS.SCHEDULED, VISIT_STATUS.RESCHEDULED] } })
      .populate('client property broker', 'name mobile public propertyType')
      .sort({ scheduledAt: 1 })
      .limit(20),
    Property.find({ status: PROPERTY_STATUS.PUBLISHED }).sort({ publishedAt: -1 }).limit(10),
    ActivityLog.find({}).populate('actor', 'name role').sort({ createdAt: -1 }).limit(30),
  ]);

  // Broker activity: leads currently assigned per broker, for at-a-glance oversight.
  const brokerActivity = await Lead.aggregate([
    { $match: { assignedBroker: { $exists: true, $ne: null } } },
    { $group: { _id: '$assignedBroker', activeLeads: { $sum: 1 } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'broker' } },
    { $unwind: '$broker' },
    { $project: { brokerId: '$_id', name: '$broker.name', mobile: '$broker.mobile', activeLeads: 1, _id: 0 } },
  ]);

  res.status(200).json({
    totals: { clients: totalClients, brokers: totalBrokers, properties: totalProperties },
    activeLeads,
    pendingFollowUps,
    overdueFollowUps,
    todaysVisits,
    upcomingVisits,
    recentProperties: recentProperties.map((p) => p.toPublicJSON()),
    brokerActivity,
    recentActivity,
  });
});

// ── Broker: "What do I need to do next?" ───────────────────────────────
const getBrokerDashboard = asyncHandler(async (req, res) => {
  const brokerId = req.user._id;

  const [
    myLeadsByStage,
    todaysFollowUps,
    overdueFollowUps,
    todaysVisits,
    upcomingVisits,
    myLineupsCount,
    recentActivity,
  ] = await Promise.all([
    Lead.aggregate([{ $match: { assignedBroker: brokerId } }, { $group: { _id: '$stage', count: { $sum: 1 } } }]),
    FollowUp.find({ broker: brokerId, status: FOLLOW_UP_STATUS.PENDING, dueAt: { $gte: startOfToday(), $lte: endOfToday() } })
      .populate('client', 'name mobile')
      .sort({ dueAt: 1 }),
    FollowUp.find({ broker: brokerId, status: FOLLOW_UP_STATUS.PENDING, dueAt: { $lt: startOfToday() } })
      .populate('client', 'name mobile')
      .sort({ dueAt: 1 }),
    Visit.find({ broker: brokerId, scheduledAt: { $gte: startOfToday(), $lte: endOfToday() } })
      .populate('client property', 'name mobile public propertyType')
      .sort({ scheduledAt: 1 }),
    Visit.find({ broker: brokerId, scheduledAt: { $gt: endOfToday() }, status: { $in: [VISIT_STATUS.SCHEDULED, VISIT_STATUS.RESCHEDULED] } })
      .populate('client property', 'name mobile public propertyType')
      .sort({ scheduledAt: 1 })
      .limit(20),
    Lineup.countDocuments({ createdBy: brokerId }),
    ActivityLog.find({ actor: brokerId }).sort({ createdAt: -1 }).limit(20),
  ]);

  const stageCounts = {};
  myLeadsByStage.forEach((row) => {
    stageCounts[row._id] = row.count;
  });

  // Next actions: leads with an explicit next-action note/date set, soonest first.
  const nextActions = await Lead.find({ assignedBroker: brokerId, nextActionDueAt: { $exists: true, $ne: null } })
    .populate('client', 'name mobile')
    .sort({ nextActionDueAt: 1 })
    .limit(20);

  res.status(200).json({
    myLeadsByStage: stageCounts,
    todaysFollowUps,
    overdueFollowUps,
    todaysVisits,
    upcomingVisits,
    myLineupsCount,
    nextActions,
    recentActivity,
  });
});

// ── Client: their own information only ─────────────────────────────────
const getClientDashboard = asyncHandler(async (req, res) => {
  const clientId = req.user._id;

  const [cartItems, upcomingVisits, pastVisits, requirement, lead, recentlyViewed] = await Promise.all([
    CartItem.find({ client: clientId }).populate('property').sort({ createdAt: -1 }),
    Visit.find({ client: clientId, scheduledAt: { $gte: new Date() } }).populate('property').sort({ scheduledAt: 1 }),
    Visit.find({ client: clientId, scheduledAt: { $lt: new Date() } }).populate('property').sort({ scheduledAt: -1 }).limit(10),
    Requirement.findOne({ client: clientId, isActive: true }),
    Lead.findOne({ client: clientId }).populate('assignedBroker', 'name mobile'),
    ActivityLog.find({ relatedClient: clientId, action: 'property.viewed' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({ path: 'subjectId', model: 'Property' }),
  ]);

  const recommended = requirement ? await matchPropertiesForRequirement(requirement) : [];

  res.status(200).json({
    shortlist: cartItems.filter((i) => i.property).map((i) => i.property.toPublicJSON()),
    visits: { upcoming: upcomingVisits, past: pastVisits },
    recentlyViewed: recentlyViewed
      .filter((e) => e.subjectId)
      .map((e) => e.subjectId.toPublicJSON && e.subjectId.toPublicJSON()),
    recommended: recommended.map((p) => p.toPublicJSON()),
    assignedBroker: lead?.assignedBroker || null,
  });
});

// ── Owner/Caretaker: "What properties and visits do I need to manage?" ──
const getOwnerDashboard = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;

  const [properties, upcomingVisits] = await Promise.all([
    Property.find({ 'internal.ownerId': ownerId }).sort({ updatedAt: -1 }),
    Visit.find({ ownerCaretaker: ownerId, scheduledAt: { $gte: new Date() } })
      .populate('property client broker', 'name mobile public propertyType')
      .sort({ scheduledAt: 1 }),
  ]);

  res.status(200).json({ properties, upcomingVisits, permissions: req.user.permissions });
});

// ── Client Activity / "Interested Clients" (Broker/Admin) ──────────────
// Spec: dedicated page showing which client viewed/shortlisted what, with
// quick call/WhatsApp actions. Built from CartItem (shortlisted) + recent
// ActivityLog (viewed) + Lead (status/follow-up).
const getClientActivityList = asyncHandler(async (req, res) => {
  const leadFilter = req.user.role === ROLES.BROKER ? { assignedBroker: req.user._id } : {};
  const leads = await Lead.find(leadFilter).populate('client', 'name mobile').sort({ updatedAt: -1 }).limit(100);

  const cards = await Promise.all(
    leads
      .filter((l) => l.client)
      .map(async (lead) => {
        const [shortlistCount, lastActivity, upcomingVisit, pendingFollowUp] = await Promise.all([
          CartItem.countDocuments({ client: lead.client._id }),
          ActivityLog.findOne({ relatedClient: lead.client._id }).sort({ createdAt: -1 }),
          Visit.findOne({ client: lead.client._id, scheduledAt: { $gte: new Date() } }).sort({ scheduledAt: 1 }),
          FollowUp.findOne({ client: lead.client._id, status: FOLLOW_UP_STATUS.PENDING }).sort({ dueAt: 1 }),
        ]);

        return {
          client: lead.client,
          stage: lead.stage,
          shortlistCount,
          lastActivity: lastActivity ? { action: lastActivity.action, at: lastActivity.createdAt } : null,
          upcomingVisit,
          nextFollowUp: pendingFollowUp,
        };
      })
  );

  res.status(200).json({ clients: cards });
});

module.exports = {
  getAdminDashboard,
  getBrokerDashboard,
  getClientDashboard,
  getOwnerDashboard,
  getClientActivityList,
};
