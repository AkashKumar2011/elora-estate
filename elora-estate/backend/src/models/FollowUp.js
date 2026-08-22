const mongoose = require('mongoose');
const { FOLLOW_UP_STATUS } = require('../config/constants');

const { Schema } = mongoose;

const followUpSchema = new Schema(
  {
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    broker: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    dueAt: { type: Date, required: true, index: true },
    note: { type: String, required: true },
    status: { type: String, enum: Object.values(FOLLOW_UP_STATUS), default: FOLLOW_UP_STATUS.PENDING, index: true },
    isPriority: { type: Boolean, default: false },

    // Traceability: what triggered this follow-up (visit outcome, manual, etc.)
    sourceType: { type: String, enum: ['manual', 'visit_outcome', 'lead_stage_change'], default: 'manual' },
    sourceVisit: { type: Schema.Types.ObjectId, ref: 'Visit' },

    completedAt: { type: Date },
  },
  { timestamps: true }
);

followUpSchema.index({ broker: 1, status: 1, dueAt: 1 });

module.exports = mongoose.model('FollowUp', followUpSchema);
