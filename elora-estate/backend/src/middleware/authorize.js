const ApiError = require('../utils/ApiError');

// authorize('admin', 'broker') → 403s anyone whose role isn't in the list.
// Must run after requireAuth (needs req.user). Kept separate from
// requireAuth so routes can compose "must be logged in" and "must be one
// of these roles" independently, e.g. some routes only need requireAuth.
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden(`This action requires one of these roles: ${allowedRoles.join(', ')}`);
    }
    next();
  };
}

module.exports = authorize;
