const mongoose = require('mongoose');
const { VISIT_STATUS, VISIT_OUTCOME } = require('../config/constants');

const { Schema } = mongoose;

const visitSchema = new Schema(
  {
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    broker: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ownerCaretaker: { type: Schema.Types.ObjectId, ref: 'User' },

    scheduledAt: { type: Date, required: true },
    status: { type: String, enum: Object.values(VISIT_STATUS), default: VISIT_STATUS.SCHEDULED, index: true },

    rescheduledFrom: { type: Date }, // set when status becomes 'rescheduled'
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: { type: String },

    outcome: { type: String, enum: Object.values(VISIT_OUTCOME) },
    outcomeNote: { type: String },
    outcomeRecordedAt: { type: Date },

    notificationsSent: {
      client: { type: Boolean, default: false },
      broker: { type: Boolean, default: false },
      ownerCaretaker: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

visitSchema.index({ broker: 1, scheduledAt: 1 });
visitSchema.index({ client: 1, scheduledAt: 1 });

module.exports = mongoose.model('Visit', visitSchema);
