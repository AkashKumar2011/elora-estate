const Property = require('../models/Property');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');
const { canAccessPropertyInternal, canEditProperty } = require('../utils/propertyAccess');
const { matchClientsForProperty } = require('../services/matchingService');
const {
  ROLES,
  PROPERTY_STATUS,
  PROPERTY_PURPOSE,
  PROPERTY_CATEGORY,
  PROPERTY_TYPE,
} = require('../config/constants');

// ── Helpers ─────────────────────────────────────────────────────────────

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

async function findPropertyOr404(id) {
  const property = await Property.findById(id);
  if (!property) throw ApiError.notFound('Property not found');
  return property;
}

// ── PUBLIC ──────────────────────────────────────────────────────────────
// Spec: default public experience is Residential + Rent. Every filter here
// operates only over public.* fields — internal.* is never queried or
// returned from this handler.

const listPublicProperties = asyncHandler(async (req, res) => {
  const {
    purpose = PROPERTY_PURPOSE.RENT,
    category = PROPERTY_CATEGORY.RESIDENTIAL,
    propertyType,
    locationArea,
    minPrice,
    maxPrice,
    bhk,
    furnishing,
    tenantType,
  } = req.query;

  const filter = { status: PROPERTY_STATUS.PUBLISHED, purpose, category };

  if (propertyType) {
    if (!Object.values(PROPERTY_TYPE).includes(propertyType)) {
      throw ApiError.badRequest('Invalid propertyType');
    }
    filter.propertyType = propertyType;
  }
  if (locationArea) filter['public.locationArea'] = locationArea;
  if (bhk) filter['public.bhk'] = Number(bhk);
  if (furnishing) filter['public.furnishing'] = furnishing;
  if (tenantType) filter.tenantType = tenantType;
  if (minPrice || maxPrice) {
    filter['public.price'] = {};
    if (minPrice) filter['public.price'].$gte = Number(minPrice);
    if (maxPrice) filter['public.price'].$lte = Number(maxPrice);
  }
  // Public listing should only ever show properties currently available,
  // unless a specific status filter is added later for "coming soon" etc.
  filter['public.availability.isAvailable'] = true;

  const { page, limit, skip } = parsePagination(req.query);
  const [total, properties] = await Promise.all([
    Property.countDocuments(filter),
    Property.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit),
  ]);

  res.status(200).json({
    properties: properties.map((p) => p.toPublicJSON()),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// Public detail view. If the requester happens to be authenticated and
// authorized for internal data (optionalAuth), we still only return the
// public shape here — internal data has its own dedicated endpoint so a
// client-facing page can never accidentally render internal fields just
// because the route was reused.
const getPublicProperty = asyncHandler(async (req, res) => {
  const property = await findPropertyOr404(req.params.id);
  if (property.status !== PROPERTY_STATUS.PUBLISHED) {
    throw ApiError.notFound('Property not found');
  }

  // Spec: "If a logged-in client views a property... this activity should
  // be stored" — feeds recently-viewed on the client dashboard and the
  // broker/admin "Client Activity" view. Anonymous browsing is not tracked.
  if (req.user && req.user.role === ROLES.CLIENT) {
    await logActivity({
      actor: req.user._id,
      action: 'property.viewed',
      subjectType: 'property',
      subjectId: property._id,
      relatedClient: req.user._id,
    });
  }

  res.status(200).json({ property: property.toPublicJSON() });
});

// ── INTERNAL (Admin / Broker / Owner-Caretaker) ────────────────────────

const listInternalProperties = asyncHandler(async (req, res) => {
  const { status, propertyType, mine } = req.query;
  const filter = {};

  if (req.user.role === ROLES.BROKER) {
    // Default broker scope per spec: only their own assigned/created work.
    filter.$or = [{ createdBy: req.user._id }, { assignedBroker: req.user._id }];
  } else if (req.user.role === ROLES.OWNER_CARETAKER) {
    filter['internal.ownerId'] = req.user._id;
  } else if (req.user.role === ROLES.ADMIN && mine === 'true') {
    filter.$or = [{ createdBy: req.user._id }, { assignedBroker: req.user._id }];
  }
  // Admin without mine=true sees everything — no additional filter.

  if (status) filter.status = status;
  if (propertyType) filter.propertyType = propertyType;

  const { page, limit, skip } = parsePagination(req.query);
  const [total, properties] = await Promise.all([
    Property.countDocuments(filter),
    Property.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
  ]);

  res.status(200).json({ properties, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

const getInternalProperty = asyncHandler(async (req, res) => {
  const property = await findPropertyOr404(req.params.id);
  if (!canAccessPropertyInternal(req.user, property)) {
    throw ApiError.forbidden('You do not have access to this property');
  }
  res.status(200).json({ property });
});

// Essential-first create: only what's needed to save a draft. Everything
// else (photos, amenities, internal contacts, documents...) is added via
// updateProperty afterwards. Matches spec's "Purpose → Category → Property
// Type → Basic Details → ... → Publish" flow — this endpoint covers up
// through "Basic Details."
const createProperty = asyncHandler(async (req, res) => {
  const { purpose, category, propertyType, tenantType, locationArea, price, bhk, furnishing } = req.body;

  if (!propertyType || !Object.values(PROPERTY_TYPE).includes(propertyType)) {
    throw ApiError.badRequest('A valid propertyType is required');
  }
  if (!locationArea) throw ApiError.badRequest('locationArea is required');
  if (price === undefined || price === null || Number(price) <= 0) {
    throw ApiError.badRequest('A valid price is required');
  }

  const property = await Property.create({
    purpose: purpose || PROPERTY_PURPOSE.RENT,
    category: category || PROPERTY_CATEGORY.RESIDENTIAL,
    propertyType,
    tenantType,
    status: PROPERTY_STATUS.DRAFT,
    public: { locationArea, price, bhk, furnishing },
    createdBy: req.user._id,
    assignedBroker: req.user.role === ROLES.BROKER ? req.user._id : req.body.assignedBroker,
  });

  await logActivity({
    actor: req.user._id,
    action: 'property.created',
    subjectType: 'property',
    subjectId: property._id,
  });

  res.status(201).json({ property });
});

// Edit-later: partial update of public.* and/or internal.* plus top-level
// fields (tenantType, assignedBroker). Deep-merges the two sub-objects so
// callers can send just the fields they're adding without wiping the rest.
const updateProperty = asyncHandler(async (req, res) => {
  const property = await findPropertyOr404(req.params.id);
  if (!canEditProperty(req.user, property)) {
    throw ApiError.forbidden('You do not have access to edit this property');
  }

  const { public: publicUpdates, internal: internalUpdates, tenantType, assignedBroker, purpose, category } = req.body;

  if (publicUpdates && typeof publicUpdates === 'object') {
    Object.assign(property.public, publicUpdates);
  }
  if (internalUpdates && typeof internalUpdates === 'object') {
    // Owner/Caretaker generally shouldn't be setting commission/negotiation
    // fields — but V1 keeps this simple and relies on the UI + the fact
    // that only Admin/Broker normally populate these. Tightening this to a
    // field-level allowlist per role is a reasonable fast-follow.
    Object.assign(property.internal, internalUpdates);
  }
  if (tenantType) property.tenantType = tenantType;
  if (purpose) property.purpose = purpose;
  if (category) property.category = category;
  if (assignedBroker && req.user.role === ROLES.ADMIN) property.assignedBroker = assignedBroker;

  await property.save();

  await logActivity({
    actor: req.user._id,
    action: 'property.updated',
    subjectType: 'property',
    subjectId: property._id,
  });

  res.status(200).json({ property });
});

const publishProperty = asyncHandler(async (req, res) => {
  const property = await findPropertyOr404(req.params.id);
  if (!canEditProperty(req.user, property)) {
    throw ApiError.forbidden('You do not have access to publish this property');
  }
  if (!property.public.locationArea || !property.public.price) {
    throw ApiError.badRequest('locationArea and price are required before publishing');
  }

  property.status = PROPERTY_STATUS.PUBLISHED;
  property.publishedAt = new Date();
  await property.save();

  await logActivity({
    actor: req.user._id,
    action: 'property.published',
    subjectType: 'property',
    subjectId: property._id,
  });

  res.status(200).json({ property });
});

const hideProperty = asyncHandler(async (req, res) => {
  const property = await findPropertyOr404(req.params.id);
  if (!canEditProperty(req.user, property)) {
    throw ApiError.forbidden('You do not have access to hide this property');
  }
  property.status = PROPERTY_STATUS.HIDDEN;
  await property.save();

  await logActivity({ actor: req.user._id, action: 'property.hidden', subjectType: 'property', subjectId: property._id });
  res.status(200).json({ property });
});

const archiveProperty = asyncHandler(async (req, res) => {
  const property = await findPropertyOr404(req.params.id);
  // Archiving is Admin-only — it's a stronger, less-reversible action than
  // hide (which brokers/owners can also do for "no longer available").
  if (req.user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('Only Admin can archive a property');
  }
  property.status = PROPERTY_STATUS.ARCHIVED;
  await property.save();

  await logActivity({ actor: req.user._id, action: 'property.archived', subjectType: 'property', subjectId: property._id });
  res.status(200).json({ property });
});

// Property → matching client requirements ("who might want this").
// Surfaced to the broker/admin right after publish, and revisitable any
// time from the property's internal detail view.
const getPropertyMatches = asyncHandler(async (req, res) => {
  const property = await findPropertyOr404(req.params.id);
  if (!canAccessPropertyInternal(req.user, property)) {
    throw ApiError.forbidden('You do not have access to this property');
  }
  const matchedRequirements = await matchClientsForProperty(property);
  res.status(200).json({
    matchCount: matchedRequirements.length,
    matches: matchedRequirements,
  });
});

module.exports = {
  listPublicProperties,
  getPublicProperty,
  listInternalProperties,
  getInternalProperty,
  createProperty,
  updateProperty,
  publishProperty,
  hideProperty,
  archiveProperty,
  getPropertyMatches,
};
