const { ROLES } = require('../config/constants');

// Who may see/edit a property's INTERNAL data:
//  - Admin: always
//  - Broker: only if they created it or are the assigned broker
//  - Owner/Caretaker: only if they are the linked owner account on that
//    property's internal.ownerId (their own property)
// Everyone else (including a client, or a broker not assigned to this
// property) gets public data only. This is enforced server-side wherever
// internal data could leak — see spec section "Security Requirement."
function canAccessPropertyInternal(user, property) {
  if (!user) return false;
  if (user.role === ROLES.ADMIN) return true;

  if (user.role === ROLES.BROKER) {
    const isCreator = property.createdBy && property.createdBy.toString() === user._id.toString();
    const isAssigned = property.assignedBroker && property.assignedBroker.toString() === user._id.toString();
    return isCreator || isAssigned;
  }

  if (user.role === ROLES.OWNER_CARETAKER) {
    const isOwner = property.internal?.ownerId && property.internal.ownerId.toString() === user._id.toString();
    return isOwner;
  }

  return false;
}

// Who may EDIT a property (create/update/publish/hide). Slightly narrower
// intent than "view internal" conceptually, but V1 keeps the same rule —
// if you can see the internal data, you can maintain it. Admin can always
// override.
function canEditProperty(user, property) {
  return canAccessPropertyInternal(user, property);
}

module.exports = { canAccessPropertyInternal, canEditProperty };
