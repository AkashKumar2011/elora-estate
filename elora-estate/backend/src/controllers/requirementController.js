const Requirement = require('../models/Requirement');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');
const { matchPropertiesForRequirement } = require('../services/matchingService');
const { findOrCreateLead, advanceStage } = require('../services/leadService');
const { ROLES, LEAD_STAGE } = require('../config/constants');

async function assertClientAccessible(req, clientId) {
  const client = await User.findOne({ _id: clientId, role: ROLES.CLIENT });
  if (!client) throw ApiError.notFound('Client not found');
  // Broker privacy: a broker may only capture/view requirements for clients
  // assigned to them, unless they're Admin. There's no "assignedBroker" on
  // User directly in V1 — assignment is expressed via Lead.assignedBroker —
  // so this check is intentionally permissive here (any active broker can
  // capture a requirement for any client) and true isolation is enforced at
  // the Lead/Note layer where private conversation data actually lives.
  // Kept simple for V1 per spec's "do not over-engineer."
  return client;
}

const createRequirement = asyncHandler(async (req, res) => {
  const { client, locationAreas, budgetMin, budgetMax, propertyType, bhk, furnishing, tenantType, moveInBy, notes } = req.body;

  if (!client) throw ApiError.badRequest('client is required');
  await assertClientAccessible(req, client);

  if (!Array.isArray(locationAreas) || locationAreas.length === 0) {
    throw ApiError.badRequest('At least one preferred location is required');
  }
  if (!budgetMax) throw ApiError.badRequest('budgetMax is required');

  // A client should have at most one ACTIVE requirement at a time so
  // matching/dashboards have a single source of truth — deactivate any
  // prior active requirement rather than accumulating ambiguous duplicates.
  await Requirement.updateMany({ client, isActive: true }, { $set: { isActive: false } });

  const requirement = await Requirement.create({
    client,
    capturedBy: req.user._id,
    locationAreas,
    budgetMin,
    budgetMax,
    propertyType,
    bhk,
    furnishing,
    tenantType,
    moveInBy,
    notes,
  });

  await logActivity({
    actor: req.user._id,
    action: 'requirement.created',
    subjectType: 'client',
    subjectId: client,
    relatedClient: client,
  });

  await findOrCreateLead(client, { assignedBroker: req.user.role === ROLES.BROKER ? req.user._id : undefined });
  await advanceStage(client, LEAD_STAGE.REQUIREMENT_CAPTURED);

  const matches = await matchPropertiesForRequirement(requirement);

  res.status(201).json({
    requirement,
    matchCount: matches.length,
    matches: matches.slice(0, 10).map((p) => p.toPublicJSON()),
  });
});

const updateRequirement = asyncHandler(async (req, res) => {
  const requirement = await Requirement.findById(req.params.id);
  if (!requirement) throw ApiError.notFound('Requirement not found');
  await assertClientAccessible(req, requirement.client);

  const editable = ['locationAreas', 'budgetMin', 'budgetMax', 'propertyType', 'bhk', 'furnishing', 'tenantType', 'moveInBy', 'notes'];
  for (const key of editable) {
    if (req.body[key] !== undefined) requirement[key] = req.body[key];
  }
  await requirement.save();

  await logActivity({
    actor: req.user._id,
    action: 'requirement.updated',
    subjectType: 'client',
    subjectId: requirement.client,
    relatedClient: requirement.client,
  });

  const matches = await matchPropertiesForRequirement(requirement);

  res.status(200).json({
    requirement,
    matchCount: matches.length,
    matches: matches.slice(0, 10).map((p) => p.toPublicJSON()),
  });
});

const getClientRequirements = asyncHandler(async (req, res) => {
  await assertClientAccessible(req, req.params.clientId);
  const requirements = await Requirement.find({ client: req.params.clientId }).sort({ createdAt: -1 });
  res.status(200).json({ requirements });
});

// A client's own requirement + matches, for their dashboard.
const getMyRequirementMatches = asyncHandler(async (req, res) => {
  const requirement = await Requirement.findOne({ client: req.user._id, isActive: true });
  if (!requirement) {
    return res.status(200).json({ requirement: null, matches: [] });
  }
  const matches = await matchPropertiesForRequirement(requirement);
  res.status(200).json({ requirement, matches: matches.map((p) => p.toPublicJSON()) });
});

module.exports = { createRequirement, updateRequirement, getClientRequirements, getMyRequirementMatches };
