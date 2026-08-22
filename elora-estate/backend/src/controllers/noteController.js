const Note = require('../models/Note');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getAssignedBroker } = require('../services/leadService');
const { canAccessPropertyInternal } = require('../utils/propertyAccess');
const Property = require('../models/Property');
const { ROLES, NOTE_TAGS } = require('../config/constants');

// Spec: "One broker should NOT be able to see another broker's private
// client conversations, notes... unless Admin explicitly gives access or
// reassigns the client." Source of truth for "who currently owns this
// client" is Lead.assignedBroker (see leadService) — reassigning the lead
// is exactly the mechanism the spec describes for granting a different
// broker access.
async function assertClientNoteAccess(user, clientId) {
  if (user.role === ROLES.ADMIN) return;
  if (user.role !== ROLES.BROKER) throw ApiError.forbidden('Only Broker/Admin can access client notes');

  const assignedBroker = await getAssignedBroker(clientId);
  if (!assignedBroker || assignedBroker.toString() !== user._id.toString()) {
    throw ApiError.forbidden('You are not the assigned broker for this client');
  }
}

const createNote = asyncHandler(async (req, res) => {
  const { client, property, text, tags } = req.body;
  if (!client && !property) throw ApiError.badRequest('Either client or property is required');
  if (client && property) throw ApiError.badRequest('A note belongs to either a client or a property, not both');
  if (!text || !text.trim()) throw ApiError.badRequest('text is required');
  if (tags && tags.some((t) => !NOTE_TAGS.includes(t))) throw ApiError.badRequest('Invalid tag');

  if (client) {
    await assertClientNoteAccess(req.user, client);
  } else {
    const prop = await Property.findById(property);
    if (!prop) throw ApiError.notFound('Property not found');
    if (!canAccessPropertyInternal(req.user, prop)) {
      throw ApiError.forbidden('You do not have access to this property');
    }
  }

  const note = await Note.create({ client, property, author: req.user._id, text: text.trim(), tags });
  res.status(201).json({ note });
});

const listClientNotes = asyncHandler(async (req, res) => {
  await assertClientNoteAccess(req.user, req.params.clientId);
  const notes = await Note.find({ client: req.params.clientId }).populate('author', 'name role').sort({ createdAt: -1 });
  res.status(200).json({ notes });
});

const listPropertyNotes = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.propertyId);
  if (!property) throw ApiError.notFound('Property not found');
  if (!canAccessPropertyInternal(req.user, property)) {
    throw ApiError.forbidden('You do not have access to this property');
  }
  const notes = await Note.find({ property: req.params.propertyId }).populate('author', 'name role').sort({ createdAt: -1 });
  res.status(200).json({ notes });
});

module.exports = { createNote, listClientNotes, listPropertyNotes };
