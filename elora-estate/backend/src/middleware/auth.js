const { verifyAccessToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { ACCOUNT_STATUS } = require('../config/constants');

// Requires a valid access token. Populates req.user with the full user
// document (minus passwordHash) so downstream handlers/authorize() have
// role, status, permissions, etc. without a second lookup.
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw ApiError.unauthorized('Missing or invalid Authorization header');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    throw ApiError.unauthorized(
      err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token'
    );
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw ApiError.unauthorized('Account no longer exists');
  }
  if (user.status === ACCOUNT_STATUS.DEACTIVATED || user.status === ACCOUNT_STATUS.REJECTED) {
    throw ApiError.forbidden('This account has been deactivated');
  }
  if (user.status === ACCOUNT_STATUS.PENDING_APPROVAL) {
    throw ApiError.forbidden('This account is pending Admin approval');
  }

  req.user = user;
  next();
});

// Like requireAuth but does not error if no/invalid token is present —
// req.user is just left undefined. Useful for public routes that behave
// slightly differently for a logged-in client (e.g. "already in cart").
const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (user && user.status === ACCOUNT_STATUS.ACTIVE) {
      req.user = user;
    }
  } catch (err) {
    // Silently ignore — this route works for anonymous visitors too.
  }
  next();
});

module.exports = { requireAuth, optionalAuth };
