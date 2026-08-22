const Lead = require('../models/Lead');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');
const { findOrCreateLead } = require('../services/leadService');
const { ROLES, LEAD_OUTCOME, DEAL_STATUS } = require('../config/constants');

const listMyLeads = asyncHandler(async (req, res) => {
  const filter = req.user.role === ROLES.ADMIN ? {} : { assignedBroker: req.user._id };
  if (req.query.stage) filter.stage = req.query.stage;

  const leads = await Lead.find(filter).populate('client', 'name mobile').sort({ updatedAt: -1 });
  res.status(200).json({ leads });
});

const getClientLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ client: req.params.clientId }).populate('client', 'name mobile');
  if (!lead) throw ApiError.notFound('No lead found for this client yet');

  if (req.user.role === ROLES.BROKER && (!lead.assignedBroker || lead.assignedBroker.toString() !== req.user._id.toString())) {
    throw ApiError.forbidden('You are not the assigned broker for this client');
  }
  res.status(200).json({ lead });
});

// "What should I do next?" — the client profile's headline field.
const setNextAction = asyncHandler(async (req, res) => {
  const { note, dueAt } = req.body;
  const lead = await findOrCreateLead(req.params.clientId, req.user.role === ROLES.BROKER ? { assignedBroker: req.user._id } : {});

  if (req.user.role === ROLES.BROKER && lead.assignedBroker && lead.assignedBroker.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You are not the assigned broker for this client');
  }

  lead.nextActionNote = note;
  lead.nextActionDueAt = dueAt ? new Date(dueAt) : undefined;
  await lead.save();

  res.status(200).json({ lead });
});

// Admin-only: the explicit reassignment mechanism the spec describes for
// granting a different broker access to a client's private data.
const reassignLead = asyncHandler(async (req, res) => {
  const { assignedBroker } = req.body;
  if (!assignedBroker) throw ApiError.badRequest('assignedBroker is required');

  const broker = await User.findOne({ _id: assignedBroker, role: ROLES.BROKER });
  if (!broker) throw ApiError.notFound('Broker not found');

  const lead = await findOrCreateLead(req.params.clientId, {});
  const previousBroker = lead.assignedBroker;
  lead.assignedBroker = assignedBroker;
  await lead.save();

  await logActivity({
    actor: req.user._id,
    action: 'client.reassigned',
    subjectType: 'lead',
    subjectId: lead._id,
    relatedClient: req.params.clientId,
    metadata: { from: previousBroker, to: assignedBroker },
  });

  res.status(200).json({ lead });
});

const setOutcome = asyncHandler(async (req, res) => {
  const { outcome } = req.body;
  if (!Object.values(LEAD_OUTCOME).includes(outcome)) throw ApiError.badRequest('Invalid outcome');

  const lead = await findOrCreateLead(req.params.clientId, req.user.role === ROLES.BROKER ? { assignedBroker: req.user._id } : {});
  if (req.user.role === ROLES.BROKER && lead.assignedBroker && lead.assignedBroker.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You are not the assigned broker for this client');
  }

  lead.outcome = outcome;
  await lead.save();

  await logActivity({
    actor: req.user._id,
    action: 'lead.outcome_set',
    subjectType: 'lead',
    subjectId: lead._id,
    relatedClient: req.params.clientId,
    metadata: { outcome },
  });

  res.status(200).json({ lead });
});

// Internal/private deal + commission fields — never exposed publicly, per
// spec section 28. Only reachable through authenticated Broker/Admin routes.
const recordDeal = asyncHandler(async (req, res) => {
  const { status, property, dealValue, commissionType, commissionValue } = req.body;
  if (status && !Object.values(DEAL_STATUS).includes(status)) throw ApiError.badRequest('Invalid deal status');

  const lead = await findOrCreateLead(req.params.clientId, req.user.role === ROLES.BROKER ? { assignedBroker: req.user._id } : {});
  if (req.user.role === ROLES.BROKER && lead.assignedBroker && lead.assignedBroker.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You are not the assigned broker for this client');
  }

  if (status) lead.deal.status = status;
  if (property) lead.deal.property = property;
  if (dealValue !== undefined) lead.deal.dealValue = dealValue;
  if (commissionType) lead.deal.commissionType = commissionType;
  if (commissionValue !== undefined) lead.deal.commissionValue = commissionValue;
  if (status === DEAL_STATUS.CLOSED) lead.deal.closedAt = new Date();

  await lead.save();

  await logActivity({
    actor: req.user._id,
    action: 'deal.updated',
    subjectType: 'lead',
    subjectId: lead._id,
    relatedClient: req.params.clientId,
    metadata: { status },
  });

  res.status(200).json({ lead });
});

module.exports = { listMyLeads, getClientLead, setNextAction, reassignLead, setOutcome, recordDeal };
