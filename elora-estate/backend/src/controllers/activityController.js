const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { assertClientAccess } = require('../utils/clientAccess');
const { ROLES } = require('../config/constants');

// Full chronological history for one client — lead created, requirement
// captured, property shared/viewed/shortlisted, visits, notes, deal status,
// etc. Spec: "should help the broker recall the entire context before
// making the next call." Backed entirely by ActivityLog, which every other
// controller already writes to via logActivity — no separate timeline
// table to keep in sync.
const getClientTimeline = asyncHandler(async (req, res) => {
  const { clientId } = req.params;

  if (req.user.role === ROLES.CLIENT) {
    if (clientId !== req.user._id.toString()) {
      throw ApiError.forbidden('You can only view your own activity');
    }
  } else {
    await assertClientAccess(req.user, clientId);
  }

  const { page, limit } = { page: Math.max(1, parseInt(req.query.page, 10) || 1), limit: Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50)) };

  const [total, events] = await Promise.all([
    ActivityLog.countDocuments({ relatedClient: clientId }),
    ActivityLog.find({ relatedClient: clientId })
      .populate('actor', 'name role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  res.status(200).json({ events, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

module.exports = { getClientTimeline };
