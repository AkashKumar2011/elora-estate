const Property = require('../models/Property');
const Requirement = require('../models/Requirement');
const { PROPERTY_STATUS, TENANT_TYPE } = require('../config/constants');

// V1 matching is deliberately simple rule/filter-based logic (spec: "Do NOT
// implement AI/ML matching," "Do not introduce numeric AI match scores").
// A property "matches" a requirement when every requirement criterion the
// broker actually specified is satisfied — unset criteria are treated as
// "no preference" and don't narrow the match.

// ── Requirement → Properties ───────────────────────────────────────────
async function matchPropertiesForRequirement(requirement) {
  const filter = {
    status: PROPERTY_STATUS.PUBLISHED,
    'public.availability.isAvailable': true,
    'public.locationArea': { $in: requirement.locationAreas },
  };

  if (requirement.budgetMax) {
    filter['public.price'] = { $lte: requirement.budgetMax };
    if (requirement.budgetMin) {
      filter['public.price'].$gte = requirement.budgetMin;
    }
  }
  if (requirement.propertyType) {
    filter.propertyType = requirement.propertyType;
  }
  if (Array.isArray(requirement.bhk) && requirement.bhk.length > 0) {
    filter['public.bhk'] = { $in: requirement.bhk };
  }
  if (Array.isArray(requirement.furnishing) && requirement.furnishing.length > 0) {
    filter['public.furnishing'] = { $in: requirement.furnishing };
  }
  if (requirement.tenantType && requirement.tenantType !== TENANT_TYPE.ANY) {
    filter.tenantType = { $in: [requirement.tenantType, TENANT_TYPE.ANY, null, undefined] };
  }

  return Property.find(filter).sort({ publishedAt: -1 }).limit(50);
}

// ── Property → Requirements ────────────────────────────────────────────
// Used when a new/updated property is published, to surface "who might
// want this" to the broker (spec: "When a new property is added later,
// the system should be able to identify existing clients whose
// requirements match that property").
async function matchClientsForProperty(property) {
  if (property.status !== PROPERTY_STATUS.PUBLISHED) return [];

  const filter = {
    isActive: true,
    locationAreas: property.public.locationArea,
  };

  const price = property.public.price;
  if (price !== undefined && price !== null) {
    filter.budgetMax = { $gte: price };
    filter.$or = [{ budgetMin: { $exists: false } }, { budgetMin: null }, { budgetMin: { $lte: price } }];
  }
  if (property.propertyType) {
    filter.$and = (filter.$and || []).concat([
      { $or: [{ propertyType: { $exists: false } }, { propertyType: null }, { propertyType: property.propertyType }] },
    ]);
  }
  if (property.public.bhk) {
    filter.$and = (filter.$and || []).concat([
      { $or: [{ bhk: { $size: 0 } }, { bhk: property.public.bhk }] },
    ]);
  }
  if (property.public.furnishing) {
    filter.$and = (filter.$and || []).concat([
      { $or: [{ furnishing: { $size: 0 } }, { furnishing: property.public.furnishing }] },
    ]);
  }
  if (property.tenantType && property.tenantType !== TENANT_TYPE.ANY) {
    filter.$and = (filter.$and || []).concat([
      { $or: [{ tenantType: { $exists: false } }, { tenantType: null }, { tenantType: property.tenantType }, { tenantType: TENANT_TYPE.ANY }] },
    ]);
  }

  return Requirement.find(filter).populate('client', 'name mobile').sort({ createdAt: -1 }).limit(50);
}

module.exports = { matchPropertiesForRequirement, matchClientsForProperty };
