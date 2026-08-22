// Wraps an async (req, res, next) controller so any thrown/rejected error
// is forwarded to next() instead of crashing the process. Avoids needing
// try/catch in every controller and avoids an extra dependency
// (express-async-errors) for something this small.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
