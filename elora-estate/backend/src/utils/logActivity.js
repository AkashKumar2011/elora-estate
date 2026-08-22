const ActivityLog = require('../models/ActivityLog');

// Fire-and-forget-ish audit/timeline writer. Deliberately does not throw on
// failure — losing an activity-log entry should never fail the business
// operation that triggered it — but does log server-side so silent data
// loss here is still visible in server logs.
async function logActivity({ actor, action, subjectType, subjectId, relatedClient, metadata }) {
  try {
    await ActivityLog.create({ actor, action, subjectType, subjectId, relatedClient, metadata });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[activity-log] failed to record "${action}":`, err.message);
  }
}

module.exports = logActivity;
