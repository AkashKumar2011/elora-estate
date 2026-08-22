const mongoose = require('mongoose');
const { Schema } = mongoose;

// Append-only. Used for two purposes:
//  1. Audit trail for internal actions (who → what → when) — Admin-visible.
//  2. Client activity timeline (viewed/shortlisted/visit events) — visible
//     to the client themselves plus their assigned broker/Admin.
// Kept as one flexible collection rather than two, since both are the same
// shape (actor, action, subject, metadata, timestamp); action name and
// subjectType distinguish audit-only events from client-facing ones.
const activityLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User' }, // null for system-generated events
    action: { type: String, required: true, index: true }, // e.g. 'property.viewed', 'visit.scheduled', 'user.approved'

    subjectType: { type: String, enum: ['client', 'property', 'visit', 'lead', 'user', 'lineup'], required: true },
    subjectId: { type: Schema.Types.ObjectId, required: true, index: true },

    // Denormalized so a client's timeline query doesn't need a join.
    relatedClient: { type: Schema.Types.ObjectId, ref: 'User', index: true },

    metadata: { type: Schema.Types.Mixed }, // e.g. { from: 'pending', to: 'active' }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activityLogSchema.index({ relatedClient: 1, createdAt: -1 });
activityLogSchema.index({ subjectType: 1, subjectId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
