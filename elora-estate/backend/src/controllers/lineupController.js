const Lineup = require('../models/Lineup');
const Property = require('../models/Property');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');
const { findOrCreateLead, advanceStage } = require('../services/leadService');
const { ROLES, LEAD_STAGE, LINEUP_ITEM_STATUS } = require('../config/constants');

async function getOrCreateLineupForClient(clientId, createdBy) {
  let lineup = await Lineup.findOne({ client: clientId });
  if (!lineup) {
    lineup = await Lineup.create({ client: clientId, createdBy, items: [] });
  }
  return lineup;
}

const getClientLineup = asyncHandler(async (req, res) => {
  const client = await User.findOne({ _id: req.params.clientId, role: ROLES.CLIENT });
  if (!client) throw ApiError.notFound('Client not found');

  const lineup = await Lineup.findOne({ client: req.params.clientId }).populate('items.property');
  res.status(200).json({ lineup: lineup || { client: req.params.clientId, items: [] } });
});

const addPropertyToLineup = asyncHandler(async (req, res) => {
  const { clientId } = req.params;
  const { propertyId } = req.body;
  if (!propertyId) throw ApiError.badRequest('propertyId is required');

  const [client, property] = await Promise.all([
    User.findOne({ _id: clientId, role: ROLES.CLIENT }),
    Property.findById(propertyId),
  ]);
  if (!client) throw ApiError.notFound('Client not found');
  if (!property) throw ApiError.notFound('Property not found');

  const lineup = await getOrCreateLineupForClient(clientId, req.user._id);

  if (lineup.items.some((i) => i.property.toString() === propertyId)) {
    throw ApiError.conflict('This property is already in the client\'s lineup');
  }
  if (lineup.items.length >= 10) {
    throw ApiError.badRequest('A lineup supports at most 10 properties');
  }

  lineup.items.push({ property: propertyId });
  await lineup.save();

  await logActivity({
    actor: req.user._id,
    action: 'lineup.property_added',
    subjectType: 'lineup',
    subjectId: lineup._id,
    relatedClient: clientId,
    metadata: { property: propertyId },
  });

  await findOrCreateLead(clientId, { assignedBroker: req.user.role === ROLES.BROKER ? req.user._id : undefined });
  await advanceStage(clientId, LEAD_STAGE.PROPERTY_SHARED);

  res.status(200).json({ lineup });
});

const updateLineupItemStatus = asyncHandler(async (req, res) => {
  const { clientId, itemId } = req.params;
  const { status } = req.body;
  if (!Object.values(LINEUP_ITEM_STATUS).includes(status)) {
    throw ApiError.badRequest('Invalid lineup item status');
  }

  const lineup = await Lineup.findOne({ client: clientId });
  if (!lineup) throw ApiError.notFound('Lineup not found');

  const item = lineup.items.id(itemId);
  if (!item) throw ApiError.notFound('Lineup item not found');

  item.status = status;
  item.statusUpdatedAt = new Date();
  await lineup.save();

  await logActivity({
    actor: req.user._id,
    action: 'lineup.item_status_changed',
    subjectType: 'lineup',
    subjectId: lineup._id,
    relatedClient: clientId,
    metadata: { property: item.property, status },
  });

  if (status === LINEUP_ITEM_STATUS.NEGOTIATION) {
    await advanceStage(clientId, LEAD_STAGE.NEGOTIATION);
  } else if (status === LINEUP_ITEM_STATUS.TOKEN_RECEIVED) {
    await advanceStage(clientId, LEAD_STAGE.TOKEN);
  }

  res.status(200).json({ lineup });
});

const removePropertyFromLineup = asyncHandler(async (req, res) => {
  const { clientId, itemId } = req.params;
  const lineup = await Lineup.findOne({ client: clientId });
  if (!lineup) throw ApiError.notFound('Lineup not found');

  const item = lineup.items.id(itemId);
  if (!item) throw ApiError.notFound('Lineup item not found');
  item.deleteOne();
  await lineup.save();

  await logActivity({
    actor: req.user._id,
    action: 'lineup.property_removed',
    subjectType: 'lineup',
    subjectId: lineup._id,
    relatedClient: clientId,
  });

  res.status(200).json({ lineup });
});

module.exports = { getClientLineup, addPropertyToLineup, updateLineupItemStatus, removePropertyFromLineup };
