const mongoose = require('mongoose');
const { NOTE_TAGS } = require('../config/constants');

const { Schema } = mongoose;

const noteSchema = new Schema(
  {
    // Exactly one of these should be set — a note belongs to a client or a property.
    client: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', index: true },

    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 1000 },
    tags: [{ type: String, enum: NOTE_TAGS }],

    // Privacy: a broker's client notes are private to them + Admin by
    // default, per spec. Enforced in the controller (author's own broker
    // scope + admin bypass), not by a public flag, so there's no accidental
    // "make it public" toggle to misuse.
  },
  { timestamps: true }
);

noteSchema.index({ client: 1, createdAt: -1 });
noteSchema.index({ property: 1, createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
