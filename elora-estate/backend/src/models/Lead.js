const mongoose = require('mongoose');
const { LEAD_STAGE, LEAD_OUTCOME, DEAL_STATUS } = require('../config/constants');

const { Schema } = mongoose;

// One active Lead per client represents "where this client is in the
// pipeline right now." Kept separate from the User record itself so a
// client's account identity is distinct from their sales-pipeline state
// (a client could, in principle, have a closed deal and later a fresh
// requirement — V1 keeps this simple with one primary lead per client,
// but the separation avoids baking pipeline state into identity).
const dealSchema = new Schema(
  {
    status: { type: String, enum: Object.values(DEAL_STATUS), default: DEAL_STATUS.NONE },
    property: { type: Schema.Types.ObjectId, ref: 'Property' },
    dealValue: { type: Number },
    commissionType: { type: String, enum: ['percentage', 'flat'] },
    commissionValue: { type: Number },
    closedAt: { type: Date },
  },
  { _id: false }
);

const leadSchema = new Schema(
  {
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedBroker: { type: Schema.Types.ObjectId, ref: 'User', index: true },

    source: {
      type: String,
      enum: ['referral', 'call', 'whatsapp', 'portal', 'public_website', 'other'],
      default: 'public_website',
    },

    stage: { type: String, enum: Object.values(LEAD_STAGE), default: LEAD_STAGE.NEW_LEAD, index: true },
    outcome: { type: String, enum: Object.values(LEAD_OUTCOME) }, // set only if lead exits the funnel

    deal: { type: dealSchema, default: () => ({}) },

    // Denormalized for fast "what should I do next" dashboard queries.
    nextActionNote: { type: String },
    nextActionDueAt: { type: Date },
  },
  { timestamps: true }
);

leadSchema.index({ assignedBroker: 1, stage: 1 });

module.exports = mongoose.model('Lead', leadSchema);
