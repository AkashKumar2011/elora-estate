const mongoose = require('mongoose');
const { Schema } = mongoose;

// Spec: "Admin should be able to add/manage locations later." Kept as its
// own tiny collection (not a hardcoded enum) so Admin can add areas without
// a code deploy, while Property.public.locationArea still stores the plain
// string name for simplicity (no join needed to render a property card).
const locationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true }, // e.g. "Worli"
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Location', locationSchema);
