// Mirrors backend/src/config/constants.js for the subset the UI needs
// directly (dropdowns/chips). If the backend enums change, update here too.

export const PROPERTY_TYPES = [
  { value: 'flat', label: 'Flat' },
  { value: 'pg', label: 'PG' },
  { value: 'single_occupancy', label: 'Single Occupancy' },
  { value: 'shared_occupancy', label: 'Shared Occupancy' },
];

export const FURNISHING_OPTIONS = [
  { value: 'unfurnished', label: 'Unfurnished' },
  { value: 'semi_furnished', label: 'Semi Furnished' },
  { value: 'fully_furnished', label: 'Fully Furnished' },
];

export const TENANT_TYPES = [
  { value: 'family', label: 'Family' },
  { value: 'bachelor_male', label: 'Bachelor (Male)' },
  { value: 'bachelor_female', label: 'Bachelor (Female)' },
  { value: 'company_lease', label: 'Company Lease' },
  { value: 'any', label: 'Any' },
];

export const PROPERTY_STATUS_LABEL = {
  draft: 'Draft',
  published: 'Published',
  hidden: 'Hidden',
  archived: 'Archived',
};

export const LEAD_STAGE_LABEL = {
  new_lead: 'New Lead',
  contacted: 'Contacted',
  requirement_captured: 'Requirement Captured',
  property_shared: 'Property Shared',
  interested: 'Interested',
  visit_scheduled: 'Visit Scheduled',
  visited: 'Visited',
  follow_up: 'Follow-up',
  negotiation: 'Negotiation',
  token: 'Token',
  deal_closed: 'Deal Closed',
};

export const LINEUP_ITEM_STATUSES = [
  'pending',
  'confirmed',
  'visited',
  'liked',
  'rejected',
  'negotiation',
  'token_received',
];

export const NOTE_TAGS = [
  'call_owner',
  'price_discussion',
  'visit_follow_up',
  'negotiation',
  'important',
  'documents_pending',
];

export const DEAL_STATUSES = ['none', 'in_negotiation', 'token_received', 'closed', 'cancelled'];
