const Visit = require('../models/Visit');
const Property = require('../models/Property');
const User = require('../models/User');
const FollowUp = require('../models/FollowUp');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');
const { notifyVisitEvent } = require('../services/notificationService');
const { findOrCreateLead, advanceStage, getAssignedBroker } = require('../services/leadService');
const { ROLES, VISIT_STATUS, VISIT_OUTCOME, LEAD_STAGE, FOLLOW_UP_STATUS } = require('../config/constants');

// Reschedule/cancel-by-client cutoff — this exact rule wasn't fully
// specified (flagged as an open question during requirements review); a
// simple, configurable time cutoff is a sensible V1 default and is easy to
// change without touching business logic elsewhere.
const CLIENT_ACTION_CUTOFF_HOURS = Number(process.env.VISIT_CLIENT_ACTION_CUTOFF_HOURS || 2);

function clientCanStillAct(visit) {
  if (![VISIT_STATUS.SCHEDULED, VISIT_STATUS.RESCHEDULED].includes(visit.status)) return false;
  const hoursUntil = (visit.scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);
  return hoursUntil >= CLIENT_ACTION_CUTOFF_HOURS;
}

async function resolveNotificationParties(visit, property) {
  const [client, broker, ownerCaretaker] = await Promise.all([
    User.findById(visit.client),
    User.findById(visit.broker),
    visit.ownerCaretaker ? User.findById(visit.ownerCaretaker) : Promise.resolve(null),
  ]);
  return { client, broker, ownerCaretaker, property };
}

// Client (post-OTP, "Schedule Visit") or Broker/Admin (from a lineup/client
// profile) can initiate. Broker is resolved from the property's assigned
// broker, falling back to the client's current lead-assigned broker.
const scheduleVisit = asyncHandler(async (req, res) => {
  const { propertyId, scheduledAt } = req.body;
  if (!propertyId || !scheduledAt) throw ApiError.badRequest('propertyId and scheduledAt are required');

  const when = new Date(scheduledAt);
  if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
    throw ApiError.badRequest('scheduledAt must be a valid future date/time');
  }

  const property = await Property.findById(propertyId);
  if (!property) throw ApiError.notFound('Property not found');

  const clientId = req.user.role === ROLES.CLIENT ? req.user._id : req.body.clientId;
  if (!clientId) throw ApiError.badRequest('clientId is required');
  if (req.user.role !== ROLES.CLIENT) {
    const client = await User.findOne({ _id: clientId, role: ROLES.CLIENT });
    if (!client) throw ApiError.notFound('Client not found');
  }

  const broker =
    property.assignedBroker || (await getAssignedBroker(clientId)) || (req.user.role === ROLES.BROKER ? req.user._id : null);
  if (!broker) throw ApiError.badRequest('No broker could be resolved for this visit — assign a broker first');

  const visit = await Visit.create({
    client: clientId,
    property: propertyId,
    broker,
    ownerCaretaker: property.internal?.ownerId,
    scheduledAt: when,
    status: VISIT_STATUS.SCHEDULED,
  });

  await findOrCreateLead(clientId, { assignedBroker: broker });
  await advanceStage(clientId, LEAD_STAGE.VISIT_SCHEDULED);

  await logActivity({
    actor: req.user._id,
    action: 'visit.scheduled',
    subjectType: 'visit',
    subjectId: visit._id,
    relatedClient: clientId,
  });

  const parties = await resolveNotificationParties(visit, property);
  await notifyVisitEvent('scheduled', { visit, ...parties });
  visit.notificationsSent = { client: true, broker: true, ownerCaretaker: Boolean(parties.ownerCaretaker) };
  await visit.save();

  res.status(201).json({ visit });
});

async function findVisitOr404(id) {
  const visit = await Visit.findById(id);
  if (!visit) throw ApiError.notFound('Visit not found');
  return visit;
}

function assertVisitAccess(user, visit) {
  if (user.role === ROLES.ADMIN) return;
  if (user.role === ROLES.CLIENT && visit.client.toString() === user._id.toString()) return;
  if (user.role === ROLES.BROKER && visit.broker.toString() === user._id.toString()) return;
  if (user.role === ROLES.OWNER_CARETAKER && visit.ownerCaretaker && visit.ownerCaretaker.toString() === user._id.toString()) return;
  throw ApiError.forbidden('You do not have access to this visit');
}

const rescheduleVisit = asyncHandler(async (req, res) => {
  const { scheduledAt } = req.body;
  const visit = await findVisitOr404(req.params.id);
  assertVisitAccess(req.user, visit);

  const when = new Date(scheduledAt);
  if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
    throw ApiError.badRequest('scheduledAt must be a valid future date/time');
  }

  if (req.user.role === ROLES.CLIENT && !clientCanStillAct(visit)) {
    throw ApiError.forbidden(`Visits can only be rescheduled at least ${CLIENT_ACTION_CUTOFF_HOURS}h in advance — contact your broker`);
  }

  visit.rescheduledFrom = visit.scheduledAt;
  visit.scheduledAt = when;
  visit.status = VISIT_STATUS.RESCHEDULED;
  await visit.save();

  await logActivity({
    actor: req.user._id,
    action: 'visit.rescheduled',
    subjectType: 'visit',
    subjectId: visit._id,
    relatedClient: visit.client,
  });

  const property = await Property.findById(visit.property);
  const parties = await resolveNotificationParties(visit, property);
  await notifyVisitEvent('rescheduled', { visit, ...parties });

  res.status(200).json({ visit });
});

const cancelVisit = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const visit = await findVisitOr404(req.params.id);
  assertVisitAccess(req.user, visit);

  if (req.user.role === ROLES.CLIENT && !clientCanStillAct(visit)) {
    throw ApiError.forbidden(`Visits can only be cancelled at least ${CLIENT_ACTION_CUTOFF_HOURS}h in advance — contact your broker`);
  }

  visit.status = VISIT_STATUS.CANCELLED;
  visit.cancelledBy = req.user._id;
  visit.cancellationReason = reason;
  await visit.save();

  await logActivity({
    actor: req.user._id,
    action: 'visit.cancelled',
    subjectType: 'visit',
    subjectId: visit._id,
    relatedClient: visit.client,
  });

  const property = await Property.findById(visit.property);
  const parties = await resolveNotificationParties(visit, property);
  await notifyVisitEvent('cancelled', { visit, ...parties });

  res.status(200).json({ visit });
});

// Broker/Admin records the outcome after the visit happens — spec section
// 25. May also spin off a follow-up automatically when the outcome calls
// for one, so a completed visit never silently drops out of the pipeline.
const recordVisitOutcome = asyncHandler(async (req, res) => {
  const { outcome, note, followUpDueAt } = req.body;
  if (!Object.values(VISIT_OUTCOME).includes(outcome)) {
    throw ApiError.badRequest('Invalid visit outcome');
  }

  const visit = await findVisitOr404(req.params.id);
  if (req.user.role === ROLES.CLIENT) throw ApiError.forbidden('Only Broker/Admin can record a visit outcome');
  assertVisitAccess(req.user, visit);

  visit.status = VISIT_STATUS.COMPLETED;
  visit.outcome = outcome;
  visit.outcomeNote = note;
  visit.outcomeRecordedAt = new Date();
  await visit.save();

  await logActivity({
    actor: req.user._id,
    action: 'visit.completed',
    subjectType: 'visit',
    subjectId: visit._id,
    relatedClient: visit.client,
    metadata: { outcome },
  });

  const stageMap = {
    [VISIT_OUTCOME.INTERESTED]: LEAD_STAGE.INTERESTED,
    [VISIT_OUTCOME.FOLLOW_UP_REQUIRED]: LEAD_STAGE.FOLLOW_UP,
    [VISIT_OUTCOME.NEGOTIATION]: LEAD_STAGE.NEGOTIATION,
    [VISIT_OUTCOME.TOKEN_RECEIVED]: LEAD_STAGE.TOKEN,
    [VISIT_OUTCOME.DEAL_CLOSED]: LEAD_STAGE.DEAL_CLOSED,
  };
  await advanceStage(visit.client, LEAD_STAGE.VISITED);
  if (stageMap[outcome]) await advanceStage(visit.client, stageMap[outcome]);

  let followUp;
  if (outcome === VISIT_OUTCOME.FOLLOW_UP_REQUIRED || outcome === VISIT_OUTCOME.NEGOTIATION) {
    followUp = await FollowUp.create({
      client: visit.client,
      broker: visit.broker,
      dueAt: followUpDueAt ? new Date(followUpDueAt) : new Date(Date.now() + 24 * 60 * 60 * 1000),
      note: note || `Follow up after visit outcome: ${outcome}`,
      status: FOLLOW_UP_STATUS.PENDING,
      sourceType: 'visit_outcome',
      sourceVisit: visit._id,
    });
  }

  res.status(200).json({ visit, followUp });
});

const listMyVisits = asyncHandler(async (req, res) => {
  const filter = req.user.role === ROLES.CLIENT ? { client: req.user._id } : { broker: req.user._id };
  const visits = await Visit.find(filter).populate('property').sort({ scheduledAt: -1 });
  res.status(200).json({ visits });
});

const listAllVisits = asyncHandler(async (req, res) => {
  const { status, from, to } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (from || to) {
    filter.scheduledAt = {};
    if (from) filter.scheduledAt.$gte = new Date(from);
    if (to) filter.scheduledAt.$lte = new Date(to);
  }
  const visits = await Visit.find(filter).populate('property client broker').sort({ scheduledAt: -1 }).limit(200);
  res.status(200).json({ visits });
});

module.exports = {
  scheduleVisit,
  rescheduleVisit,
  cancelVisit,
  recordVisitOutcome,
  listMyVisits,
  listAllVisits,
};
