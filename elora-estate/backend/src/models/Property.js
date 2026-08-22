const mongoose = require('mongoose');
const {
  PROPERTY_PURPOSE,
  PROPERTY_CATEGORY,
  PROPERTY_TYPE,
  PROPERTY_STATUS,
  FURNISHING,
  TENANT_TYPE,
} = require('../config/constants');

const { Schema } = mongoose;

// ── PUBLIC-SAFE sub-schema ────────────────────────────────────────────────
// Everything in here is safe to serve on the public site / public API.
// Nothing internal should ever be added to this object.
const publicDataSchema = new Schema(
  {
    title: { type: String, trim: true }, // e.g. "2 BHK in Worli" — can be auto-generated
    description: { type: String, trim: true, maxlength: 2000 },
    locationArea: { type: String, required: true, trim: true }, // e.g. "Worli" — from admin-managed location list
    buildingName: { type: String, trim: true }, // society/building name — public-appropriate only, no exact unit
    photos: [{ type: String }], // URLs
    videoUrl: { type: String },
    price: { type: Number, required: true }, // rent amount (V1 = rental only)
    priceUnit: { type: String, enum: ['per_month', 'per_bed_per_month'], default: 'per_month' },
    bhk: { type: Number }, // for Flat
    furnishing: { type: String, enum: Object.values(FURNISHING) },
    amenities: [{ type: String }], // public-appropriate amenities only
    availability: {
      isAvailable: { type: Boolean, default: true },
      availableFrom: { type: Date },
    },
    // Type-specific public fields (kept flexible; validated at controller level
    // per selected propertyType rather than forcing a rigid schema per type).
    typeSpecific: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

// ── INTERNAL-ONLY sub-schema ──────────────────────────────────────────────
// MUST NEVER be sent in any public-facing response. Only Admin/Broker (and
// permission-granted Owner/Caretaker) can read this via authorized routes.
const internalDataSchema = new Schema(
  {
    exactUnitNumber: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' }, // owner/caretaker account, if any
    ownerContactName: { type: String },
    ownerContactMobile: { type: String },
    caretakerContactName: { type: String },
    caretakerContactMobile: { type: String },
    commissionType: { type: String, enum: ['percentage', 'flat'] },
    commissionValue: { type: Number },
    keysInfo: { type: String },
    documents: [{ type: String }], // URLs, internal-access only
    privateBuildingInfo: { type: String },
  },
  { _id: false }
);

const propertySchema = new Schema(
  {
    purpose: { type: String, enum: Object.values(PROPERTY_PURPOSE), default: PROPERTY_PURPOSE.RENT },
    category: { type: String, enum: Object.values(PROPERTY_CATEGORY), default: PROPERTY_CATEGORY.RESIDENTIAL },
    propertyType: { type: String, enum: Object.values(PROPERTY_TYPE), required: true },
    tenantType: { type: String, enum: Object.values(TENANT_TYPE) },

    status: { type: String, enum: Object.values(PROPERTY_STATUS), default: PROPERTY_STATUS.DRAFT, index: true },

    public: { type: publicDataSchema, required: true, default: () => ({}) },
    internal: { type: internalDataSchema, default: () => ({}) },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBroker: { type: Schema.Types.ObjectId, ref: 'User', index: true },

    publishedAt: { type: Date },
  },
  { timestamps: true }
);

propertySchema.index({ status: 1, category: 1, propertyType: 1, 'public.locationArea': 1 });
propertySchema.index({ status: 1, 'public.price': 1 });

// Convenience method: strip internal data for any public-facing response.
// Controllers should use this instead of manually picking fields, so the
// public/internal boundary lives in exactly one place.
propertySchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  return {
    id: obj._id,
    purpose: obj.purpose,
    category: obj.category,
    propertyType: obj.propertyType,
    tenantType: obj.tenantType,
    status: obj.status,
    ...obj.public,
  };
};

module.exports = mongoose.model('Property', propertySchema);
