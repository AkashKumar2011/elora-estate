const Lead = require('../models/Lead');
const ApiError = require('./ApiError');
const { ROLES } = require('../config/constants');

// Broker privacy (spec): a broker should normally only see clients/data
// assigned to them. Assignment lives on Lead.assignedBroker (the CRM
// pipeline record), not on User itself — a client's identity shouldn't
// carry sales-assignment state. Admin always bypasses this check.
//
// If a client has no Lead yet (e.g. requirement captured but pipeline
// record not created), V1 falls back to permissive access for any active
// broker — consistent with the same pragmatic call made in
// requirementController — so V1 doesn't block ordinary CRM work while
// still enforcing the privacy rule wherever a Lead/assignment exists.
async function isClientAccessibleByBroker(clientId, brokerId) {
  const lead = await Lead.findOne({ client: clientId });
  if (!lead) return true; // no assignment recorded yet — permissive default for V1
  return lead.assignedBroker && lead.assignedBroker.toString() === brokerId.toString();
}

async function assertClientAccess(user, clientId) {
  if (user.role === ROLES.ADMIN) return;
  if (user.role !== ROLES.BROKER) return; // client accessing their own data is checked separately by callers
  const allowed = await isClientAccessibleByBroker(clientId, user._id);
  if (!allowed) {
    throw ApiError.forbidden('This client is assigned to another broker');
  }
}

module.exports = { isClientAccessibleByBroker, assertClientAccess };
