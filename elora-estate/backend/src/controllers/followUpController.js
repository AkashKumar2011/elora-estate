const FollowUp = require('../models/FollowUp');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');
const { ROLES, FOLLOW_UP_STATUS } = require('../config/constants');

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

function brokerScopeFilter(req) {
  // Admin sees every broker's follow-ups (spec: full oversight); Broker
  // sees only their own, unless explicitly querying another broker's as
  // Admin via ?broker=.
  if (req.user.role === ROLES.ADMIN) {
    return req.query.broker ? { broker: req.query.broker } : {};
  }
  return { broker: req.user._id };
}

const createFollowUp = asyncHandler(async (req, res) => {
  const { client, dueAt, note, isPriority } = req.body;
  if (!client || !dueAt || !note) throw ApiError.badRequest('client, dueAt and note are required');

  const followUp = await FollowUp.create({
    client,
    broker: req.user.role === ROLES.BROKER ? req.user._id : req.body.broker,
    dueAt: new Date(dueAt),
    note,
    isPriority: Boolean(isPriority),
    sourceType: 'manual',
  });

  await logActivity({
    actor: req.user._id,
    action: 'followup.created',
    subjectType: 'client',
    subjectId: client,
    relatedClient: client,
  });

  res.status(201).json({ followUp });
});

const getDashboardBuckets = asyncHandler(async (req, res) => {
  const scope = brokerScopeFilter(req);
  const base = { ...scope, status: FOLLOW_UP_STATUS.PENDING };

  const [today, overdue, upcoming, priority] = await Promise.all([
    FollowUp.find({ ...base, dueAt: { $gte: startOfToday(), $lte: endOfToday() } })
      .populate('client', 'name mobile')
      .sort({ dueAt: 1 }),
    FollowUp.find({ ...base, dueAt: { $lt: startOfToday() } })
      .populate('client', 'name mobile')
      .sort({ dueAt: 1 }),
    FollowUp.find({ ...base, dueAt: { $gt: endOfToday() } })
      .populate('client', 'name mobile')
      .sort({ dueAt: 1 })
      .limit(50),
    FollowUp.find({ ...base, isPriority: true })
      .populate('client', 'name mobile')
      .sort({ dueAt: 1 }),
  ]);

  res.status(200).json({ today, overdue, upcoming, priority });
});

const completeFollowUp = asyncHandler(async (req, res) => {
  const followUp = await FollowUp.findById(req.params.id);
  if (!followUp) throw ApiError.notFound('Follow-up not found');
  if (req.user.role === ROLES.BROKER && followUp.broker.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You do not have access to this follow-up');
  }

  followUp.status = FOLLOW_UP_STATUS.DONE;
  followUp.completedAt = new Date();
  await followUp.save();

  await logActivity({
    actor: req.user._id,
    action: 'followup.completed',
    subjectType: 'client',
    subjectId: followUp.client,
    relatedClient: followUp.client,
  });

  res.status(200).json({ followUp });
});

// Spec: "Do not allow important client interactions to disappear without a
// next action" — snoozing requires supplying the NEXT due date, so a
// follow-up can be deferred but never just vanishes without being resolved.
const snoozeFollowUp = asyncHandler(async (req, res) => {
  const { dueAt } = req.body;
  if (!dueAt) throw ApiError.badRequest('A new dueAt is required to snooze a follow-up');

  const followUp = await FollowUp.findById(req.params.id);
  if (!followUp) throw ApiError.notFound('Follow-up not found');
  if (req.user.role === ROLES.BROKER && followUp.broker.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You do not have access to this follow-up');
  }

  followUp.dueAt = new Date(dueAt);
  followUp.status = FOLLOW_UP_STATUS.PENDING; // snoozed = still pending, just pushed out
  await followUp.save();

  res.status(200).json({ followUp });
});

module.exports = { createFollowUp, getDashboardBuckets, completeFollowUp, snoozeFollowUp };
