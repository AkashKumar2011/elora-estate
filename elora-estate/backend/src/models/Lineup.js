const mongoose = require('mongoose');
const { LINEUP_ITEM_STATUS } = require('../config/constants');

const { Schema } = mongoose;

const lineupItemSchema = new Schema(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    status: { type: String, enum: Object.values(LINEUP_ITEM_STATUS), default: LINEUP_ITEM_STATUS.PENDING },
    addedAt: { type: Date, default: Date.now },
    statusUpdatedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// One lineup document per client keeps "the client's active comparison set"
// as a single unit to render, matching the spec's framing of Lineup as a
// per-client curated group rather than a log of individual additions.
const lineupSchema = new Schema(
  {
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // broker/admin
    items: {
      type: [lineupItemSchema],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: 'A lineup supports at most 10 properties.',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lineup', lineupSchema);
