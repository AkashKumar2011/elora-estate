const User = require('../models/User');
const Lead = require('../models/Lead');
const Requirement = require('../models/Requirement');
const Lineup = require('../models/Lineup');
const CartItem = require('../models/CartItem');
const Visit = require('../models/Visit');
const FollowUp = require('../models/FollowUp');
const Note = require('../models/Note');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');
const { assertClientAccess } = require('../utils/clientAccess');
const { findOrCreateLead } = require('../services/leadService');
const { ROLES, FOLLOW_UP_STATUS, GENDER } = require('../config/constants');

const MOBILE_RE = /^[0-9]{10}$/;

// Spec: "Leads come from multiple sources such as referrals, calls,
// WhatsApp and property portals" and "Broker can: Add/manage clients." Not
// every client arrives via public OTP self-signup — a broker taking a
// phone call needs to create the profile themselves. Reuses the same User
// role=client record; if that person later logs in via OTP with the same
// mobile number, they land on this same account (auth looks up by mobile).
const createClient = asyncHandler(async (req, res) => {
  const { name, mobile, gender, source } = req.body;

  if (!name || !name.trim()) throw ApiError.badRequest('Name is required');
  if (!MOBILE_RE.test(mobile || '')) throw ApiError.badRequest('A valid 10-digit mobile number is required');
  if (gender && !Object.values(GENDER).includes(gender)) throw ApiError.badRequest('Invalid gender value');

  const existing = await User.findOne({ mobile, role: ROLES.CLIENT });
  if (existing) throw ApiError.conflict('A client with this mobile number already exists');

  const client = await User.create({ role: ROLES.CLIENT, name: name.trim(), mobile, gender });

  const lead = await findOrCreateLead(client._id, {
    assignedBroker: req.user.role === ROLES.BROKER ? req.user._id : undefined,
    source: source || 'other',
  });

  await logActivity({
    actor: req.user._id,
    action: 'client.created',
    subjectType: 'client',
    subjectId: client._id,
    relatedClient: client._id,
    metadata: { source: lead.source },
  });

  res.status(201).json({ client, lead });
});

// Broker sees only their assigned clients (via Lead); Admin sees everyone,
// optionally filtered to one broker. This is the "Clients" module list
// page — the CRM summary below is what a broker opens from here.
const listClients = asyncHandler(async (req, res) => {
  const { search, stage, broker } = req.query;

  let clientIds = null;
  if (req.user.role === ROLES.BROKER || (req.user.role === ROLES.ADMIN && broker)) {
    const leadFilter = { assignedBroker: req.user.role === ROLES.BROKER ? req.user._id : broker };
    if (stage) leadFilter.stage = stage;
    const leads = await Lead.find(leadFilter).select('client');
    clientIds = leads.map((l) => l.client);
  }

  const filter = { role: ROLES.CLIENT };
  if (clientIds) filter._id = { $in: clientIds };
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { mobile: new RegExp(search, 'i') }];

  const clients = await User.find(filter).sort({ createdAt: -1 }).limit(200);

  // Attach lead stage per client — the list page shows it as a quick badge,
  // and fetching it here saves the frontend an N+1 lookup.
  const leadsForClients = await Lead.find({ client: { $in: clients.map((c) => c._id) } }).select('client stage');
  const stageByClient = new Map(leadsForClients.map((l) => [l.client.toString(), l.stage]));
  const clientsWithStage = clients.map((c) => ({ ...c.toObject(), leadStage: stageByClient.get(c._id.toString()) || null }));

  res.status(200).json({ clients: clientsWithStage });
});

// Everything a broker/admin needs about one client in a single call —
// spec section 21's explicit goal.
const getClientCrmSummary = asyncHandler(async (req, res) => {
  const { clientId } = req.params;

  const client = await User.findOne({ _id: clientId, role: ROLES.CLIENT });
  if (!client) throw ApiError.notFound('Client not found');

  await assertClientAccess(req.user, clientId);

  const [lead, requirement, lineup, cartItems, upcomingVisits, pastVisits, pendingFollowUps, noteCount, lastActivity] =
    await Promise.all([
      Lead.findOne({ client: clientId }),
      Requirement.findOne({ client: clientId, isActive: true }),
      Lineup.findOne({ client: clientId }).populate('items.property'),
      CartItem.find({ client: clientId }).populate('property'),
      Visit.find({ client: clientId, scheduledAt: { $gte: new Date() } }).populate('property').sort({ scheduledAt: 1 }),
      Visit.find({ client: clientId, scheduledAt: { $lt: new Date() } }).populate('property').sort({ scheduledAt: -1 }).limit(10),
      FollowUp.find({ client: clientId, status: FOLLOW_UP_STATUS.PENDING }).sort({ dueAt: 1 }),
      Note.countDocuments({ client: clientId }),
      ActivityLog.findOne({ relatedClient: clientId }).sort({ createdAt: -1 }).populate('actor', 'name role'),
    ]);

  res.status(200).json({
    client,
    lead,
    requirement,
    lineup: lineup || { items: [] },
    shortlist: cartItems.filter((i) => i.property).map((i) => i.property.toPublicJSON()),
    visits: { upcoming: upcomingVisits, past: pastVisits },
    pendingFollowUps,
    noteCount,
    lastActivity,
  });
});

module.exports = { listClients, createClient, getClientCrmSummary };
