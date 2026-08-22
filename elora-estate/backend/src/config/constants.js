// Single source of truth for all fixed enums used across models/controllers.
// Per product spec: the lead pipeline and role set are FIXED for V1 (not
// admin-configurable). If that changes in a future version, this is the
// one place to update.

const ROLES = Object.freeze({
  ADMIN: 'admin',
  BROKER: 'broker',
  OWNER_CARETAKER: 'owner_caretaker',
  CLIENT: 'client',
});

const INTERNAL_ROLES = [ROLES.ADMIN, ROLES.BROKER, ROLES.OWNER_CARETAKER];

const ACCOUNT_STATUS = Object.freeze({
  PENDING_APPROVAL: 'pending_approval', // broker/owner-caretaker post-registration
  ACTIVE: 'active',
  REJECTED: 'rejected',
  DEACTIVATED: 'deactivated',
});

const GENDER = Object.freeze({
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
  PREFER_NOT_TO_SAY: 'prefer_not_to_say',
});

const PROPERTY_PURPOSE = Object.freeze({
  RENT: 'rent',
  // SALE is future scope (V1 default/primary use case is Residential Rental)
  SALE: 'sale',
});

const PROPERTY_CATEGORY = Object.freeze({
  RESIDENTIAL: 'residential',
  // COMMERCIAL is future scope — kept in the enum so the schema doesn't
  // block it later, but no commercial workflow/fields are built in V1.
  COMMERCIAL: 'commercial',
});

const PROPERTY_TYPE = Object.freeze({
  FLAT: 'flat',
  PG: 'pg',
  SINGLE_OCCUPANCY: 'single_occupancy',
  SHARED_OCCUPANCY: 'shared_occupancy',
});

const PROPERTY_STATUS = Object.freeze({
  DRAFT: 'draft', // essential fields only, not yet public
  PUBLISHED: 'published',
  HIDDEN: 'hidden', // admin/broker took it off public site (e.g. no longer available)
  ARCHIVED: 'archived',
});

// Fixed V1 lead pipeline — intentionally NOT configurable per spec.
const LEAD_STAGE = Object.freeze({
  NEW_LEAD: 'new_lead',
  CONTACTED: 'contacted',
  REQUIREMENT_CAPTURED: 'requirement_captured',
  PROPERTY_SHARED: 'property_shared',
  INTERESTED: 'interested',
  VISIT_SCHEDULED: 'visit_scheduled',
  VISITED: 'visited',
  FOLLOW_UP: 'follow_up',
  NEGOTIATION: 'negotiation',
  TOKEN: 'token',
  DEAL_CLOSED: 'deal_closed',
});

const LEAD_OUTCOME = Object.freeze({
  NOT_INTERESTED: 'not_interested',
  REJECTED: 'rejected',
  LOST: 'lost',
});

const LINEUP_ITEM_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  VISITED: 'visited',
  LIKED: 'liked',
  REJECTED: 'rejected',
  NEGOTIATION: 'negotiation',
  TOKEN_RECEIVED: 'token_received',
});

const VISIT_STATUS = Object.freeze({
  SCHEDULED: 'scheduled',
  RESCHEDULED: 'rescheduled',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
});

const VISIT_OUTCOME = Object.freeze({
  INTERESTED: 'interested',
  NOT_INTERESTED: 'not_interested',
  FOLLOW_UP_REQUIRED: 'follow_up_required',
  NEGOTIATION: 'negotiation',
  TOKEN_RECEIVED: 'token_received',
  DEAL_CLOSED: 'deal_closed',
});

const NOTE_TAGS = Object.freeze([
  'call_owner',
  'price_discussion',
  'visit_follow_up',
  'negotiation',
  'important',
  'documents_pending',
]);

const FOLLOW_UP_STATUS = Object.freeze({
  PENDING: 'pending',
  DONE: 'done',
  SNOOZED: 'snoozed',
});

const DEAL_STATUS = Object.freeze({
  NONE: 'none',
  IN_NEGOTIATION: 'in_negotiation',
  TOKEN_RECEIVED: 'token_received',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
});

const TENANT_TYPE = Object.freeze({
  FAMILY: 'family',
  BACHELOR_MALE: 'bachelor_male',
  BACHELOR_FEMALE: 'bachelor_female',
  COMPANY_LEASE: 'company_lease',
  ANY: 'any',
});

const FURNISHING = Object.freeze({
  UNFURNISHED: 'unfurnished',
  SEMI_FURNISHED: 'semi_furnished',
  FULLY_FURNISHED: 'fully_furnished',
});

module.exports = {
  ROLES,
  INTERNAL_ROLES,
  ACCOUNT_STATUS,
  GENDER,
  PROPERTY_PURPOSE,
  PROPERTY_CATEGORY,
  PROPERTY_TYPE,
  PROPERTY_STATUS,
  LEAD_STAGE,
  LEAD_OUTCOME,
  LINEUP_ITEM_STATUS,
  VISIT_STATUS,
  VISIT_OUTCOME,
  NOTE_TAGS,
  FOLLOW_UP_STATUS,
  DEAL_STATUS,
  TENANT_TYPE,
  FURNISHING,
};
