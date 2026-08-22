const mongoose = require('mongoose');
const { Schema } = mongoose;

// Client-driven only. A broker/admin never writes to this collection —
// that's what Lineup is for. Kept as its own collection (not embedded in
// User) so activity/timestamps per saved property are easy to query.
const cartItemSchema = new Schema(
  {
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  },
  { timestamps: true }
);

cartItemSchema.index({ client: 1, property: 1 }, { unique: true });

module.exports = mongoose.model('CartItem', cartItemSchema);
