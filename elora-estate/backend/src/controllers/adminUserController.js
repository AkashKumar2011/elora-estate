const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');
const { ROLES, ACCOUNT_STATUS } = require('../config/constants');

// All handlers here are mounted behind requireAuth + authorize('admin').

const listInternalUsers = asyncHandler(async (req, res) => {
  const { role, status } = req.query;
  const filter = { role: { $in: [ROLES.BROKER, ROLES.OWNER_CARETAKER] } };
  if (role) filter.role = role;
  if (status) filter.status = status;

  const users = await User.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ users });
});

async function findManageableUser(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === ROLES.ADMIN) {
    throw ApiError.forbidden('Admin accounts cannot be managed through this endpoint');
  }
  return user;
}

const approveUser = asyncHandler(async (req, res) => {
  const user = await findManageableUser(req.params.userId);
  user.status = ACCOUNT_STATUS.ACTIVE;
  user.approvedBy = req.user._id;
  user.approvedAt = new Date();
  user.rejectionReason = undefined;
  await user.save();

  await logActivity({
    actor: req.user._id,
    action: 'user.approved',
    subjectType: 'user',
    subjectId: user._id,
  });

  res.status(200).json({ user });
});

const rejectUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const user = await findManageableUser(req.params.userId);
  user.status = ACCOUNT_STATUS.REJECTED;
  user.rejectionReason = reason;
  await user.save();

  await logActivity({
    actor: req.user._id,
    action: 'user.rejected',
    subjectType: 'user',
    subjectId: user._id,
    metadata: { reason },
  });

  res.status(200).json({ user });
});

const deactivateUser = asyncHandler(async (req, res) => {
  const user = await findManageableUser(req.params.userId);
  user.status = ACCOUNT_STATUS.DEACTIVATED;
  await user.save();

  await logActivity({
    actor: req.user._id,
    action: 'user.deactivated',
    subjectType: 'user',
    subjectId: user._id,
  });

  res.status(200).json({ user });
});

const reactivateUser = asyncHandler(async (req, res) => {
  const user = await findManageableUser(req.params.userId);
  if (user.status !== ACCOUNT_STATUS.DEACTIVATED) {
    throw ApiError.badRequest('Only a deactivated account can be reactivated');
  }
  user.status = ACCOUNT_STATUS.ACTIVE;
  await user.save();

  await logActivity({
    actor: req.user._id,
    action: 'user.reactivated',
    subjectType: 'user',
    subjectId: user._id,
  });

  res.status(200).json({ user });
});

// Change role between broker <-> owner_caretaker only. Promoting to Admin
// is intentionally not exposed via API — spec: Admin is never a signup/
// self-service role, so making it reachable via a role-change endpoint
// would be a backdoor around that rule. Use the seed script instead.
const changeRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (![ROLES.BROKER, ROLES.OWNER_CARETAKER].includes(role)) {
    throw ApiError.badRequest('role must be "broker" or "owner_caretaker"');
  }
  const user = await findManageableUser(req.params.userId);
  const previousRole = user.role;
  user.role = role;
  await user.save();

  await logActivity({
    actor: req.user._id,
    action: 'user.role_changed',
    subjectType: 'user',
    subjectId: user._id,
    metadata: { from: previousRole, to: role },
  });

  res.status(200).json({ user });
});

// Owner/Caretaker-only: grant/revoke the extra visibility flags defined on
// User.permissions. Least-privilege by default per spec.
const updatePermissions = asyncHandler(async (req, res) => {
  const user = await findManageableUser(req.params.userId);
  if (user.role !== ROLES.OWNER_CARETAKER) {
    throw ApiError.badRequest('Permissions only apply to Owner/Caretaker accounts');
  }

  const allowedKeys = [
    'viewClientInfo',
    'viewClientNotes',
    'viewBrokerInfo',
    'viewCompanyReports',
    'viewVisitInfo',
  ];
  const updates = {};
  for (const key of allowedKeys) {
    if (typeof req.body[key] === 'boolean') updates[key] = req.body[key];
  }
  if (Object.keys(updates).length === 0) {
    throw ApiError.badRequest('No valid permission fields provided');
  }

  Object.assign(user.permissions, updates);
  await user.save();

  await logActivity({
    actor: req.user._id,
    action: 'user.permissions_changed',
    subjectType: 'user',
    subjectId: user._id,
    metadata: updates,
  });

  res.status(200).json({ user });
});

module.exports = {
  listInternalUsers,
  approveUser,
  rejectUser,
  deactivateUser,
  reactivateUser,
  changeRole,
  updatePermissions,
};
