const Lead = require('../models/Lead');
const { LEAD_STAGE } = require('../config/constants');

// Order matters: used to avoid moving a lead "backwards" when an earlier
// stage's action happens to fire again (e.g. a second property shared
// after a visit already happened).
const STAGE_ORDER = [
  LEAD_STAGE.NEW_LEAD,
  LEAD_STAGE.CONTACTED,
  LEAD_STAGE.REQUIREMENT_CAPTURED,
  LEAD_STAGE.PROPERTY_SHARED,
  LEAD_STAGE.INTERESTED,
  LEAD_STAGE.VISIT_SCHEDULED,
  LEAD_STAGE.VISITED,
  LEAD_STAGE.FOLLOW_UP,
  LEAD_STAGE.NEGOTIATION,
  LEAD_STAGE.TOKEN,
  LEAD_STAGE.DEAL_CLOSED,
];

// Every client should have exactly one Lead record tracking pipeline
// position (spec: fixed, non-configurable V1 pipeline). Created lazily the
// first time something pipeline-relevant happens for a client, rather than
// forcing a separate "create lead" step before a broker can do anything.
async function findOrCreateLead(clientId, { assignedBroker, source } = {}) {
  let lead = await Lead.findOne({ client: clientId });
  if (!lead) {
    lead = await Lead.create({
      client: clientId,
      assignedBroker,
      source: source || 'other',
      stage: LEAD_STAGE.NEW_LEAD,
    });
  } else if (assignedBroker && !lead.assignedBroker) {
    lead.assignedBroker = assignedBroker;
    await lead.save();
  }
  return lead;
}

// Advances stage only forward, never backward — an outcome that maps to an
// earlier stage than the lead is already at is ignored rather than
// regressing pipeline state.
async function advanceStage(clientId, targetStage) {
  const lead = await findOrCreateLead(clientId);
  const currentIdx = STAGE_ORDER.indexOf(lead.stage);
  const targetIdx = STAGE_ORDER.indexOf(targetStage);
  if (targetIdx > currentIdx) {
    lead.stage = targetStage;
    await lead.save();
  }
  return lead;
}

async function getAssignedBroker(clientId) {
  const lead = await Lead.findOne({ client: clientId });
  return lead?.assignedBroker || null;
}

module.exports = { findOrCreateLead, advanceStage, getAssignedBroker, STAGE_ORDER };
