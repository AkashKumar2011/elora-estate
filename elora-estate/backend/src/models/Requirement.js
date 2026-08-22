const mongoose = require('mongoose');
const { PROPERTY_TYPE, FURNISHING, TENANT_TYPE } = require('../config/constants');

const { Schema } = mongoose;

const requirementSchema = new Schema(
  {
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    capturedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // broker/admin who captured it

    locationAreas: [{ type: String, required: true }], // one or more preferred areas
    budgetMin: { type: Number },
    budgetMax: { type: Number, required: true },
    propertyType: { type: String, enum: Object.values(PROPERTY_TYPE) },
    bhk: [{ type: Number }], // client may accept a range, e.g. [2, 3]
    furnishing: [{ type: String, enum: Object.values(FURNISHING) }],
    tenantType: { type: String, enum: Object.values(TENANT_TYPE) },
    moveInBy: { type: Date },
    notes: { type: String },

    isActive: { type: Boolean, default: true }, // client may have prior inactive requirements once fulfilled
  },
  { timestamps: true }
);

requirementSchema.index({ isActive: 1, locationAreas: 1, propertyType: 1, budgetMax: 1 });

module.exports = mongoose.model('Requirement', requirementSchema);
