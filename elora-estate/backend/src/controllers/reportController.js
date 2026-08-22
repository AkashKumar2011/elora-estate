const User = require('../models/User');
const Property = require('../models/Property');
const Lead = require('../models/Lead');
const Visit = require('../models/Visit');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES, PROPERTY_STATUS, LEAD_STAGE, DEAL_STATUS, VISIT_STATUS } = require('../config/constants');

// Per-broker rollup: pipeline distribution, visits run, deals closed and
// commission earned. Admin-only — commission figures are internal per spec.
const getBrokerPerformanceReport = asyncHandler(async (req, res) => {
  const brokers = await User.find({ role: ROLES.BROKER }).select('name mobile status');

  const rows = await Promise.all(
    brokers.map(async (broker) => {
      const [leadsByStage, visitsCompleted, closedDeals] = await Promise.all([
        Lead.aggregate([
          { $match: { assignedBroker: broker._id } },
          { $group: { _id: '$stage', count: { $sum: 1 } } },
        ]),
        Visit.countDocuments({ broker: broker._id, status: VISIT_STATUS.COMPLETED }),
        Lead.find({ assignedBroker: broker._id, 'deal.status': DEAL_STATUS.CLOSED }).select('deal'),
      ]);

      const stageCounts = Object.fromEntries(Object.values(LEAD_STAGE).map((s) => [s, 0]));
      leadsByStage.forEach((row) => {
        stageCounts[row._id] = row.count;
      });

      const totalCommission = closedDeals.reduce((sum, lead) => {
        if (lead.deal.commissionType === 'flat') return sum + (lead.deal.commissionValue || 0);
        if (lead.deal.commissionType === 'percentage' && lead.deal.dealValue) {
          return sum + (lead.deal.dealValue * (lead.deal.commissionValue || 0)) / 100;
        }
        return sum;
      }, 0);

      return {
        broker: { id: broker._id, name: broker.name, mobile: broker.mobile, status: broker.status },
        totalLeads: Object.values(stageCounts).reduce((a, b) => a + b, 0),
        leadsByStage: stageCounts,
        visitsCompleted,
        dealsClosed: closedDeals.length,
        totalCommission,
      };
    })
  );

  res.status(200).json({ brokers: rows });
});

// Business-wide snapshot — the numbers behind the Admin dashboard, as a
// standalone reportable view (optionally date-scoped later; V1 is a
// current-state snapshot, matching what the dashboard already shows).
const getBusinessSummaryReport = asyncHandler(async (req, res) => {
  const [totalClients, totalBrokers, totalOwners, totalProperties, publishedProperties, leadsByStage, dealsClosed] =
    await Promise.all([
      User.countDocuments({ role: ROLES.CLIENT }),
      User.countDocuments({ role: ROLES.BROKER }),
      User.countDocuments({ role: ROLES.OWNER_CARETAKER }),
      Property.countDocuments({}),
      Property.countDocuments({ status: PROPERTY_STATUS.PUBLISHED }),
      Lead.aggregate([{ $group: { _id: '$stage', count: { $sum: 1 } } }]),
      Lead.countDocuments({ 'deal.status': DEAL_STATUS.CLOSED }),
    ]);

  const stageCounts = Object.fromEntries(Object.values(LEAD_STAGE).map((s) => [s, 0]));
  leadsByStage.forEach((row) => {
    stageCounts[row._id] = row.count;
  });

  res.status(200).json({
    totals: { clients: totalClients, brokers: totalBrokers, ownersCaretakers: totalOwners, properties: totalProperties, publishedProperties },
    leadsByStage: stageCounts,
    dealsClosed,
  });
});

module.exports = { getBrokerPerformanceReport, getBusinessSummaryReport };
