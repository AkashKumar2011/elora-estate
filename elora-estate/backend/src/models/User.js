const mongoose = require('mongoose');
const { ROLES, ACCOUNT_STATUS, GENDER } = require('../config/constants');

const { Schema } = mongoose;

const permissionsSchema = new Schema(
  {
    // Admin-grantable extra visibility for Owner/Caretaker role only.
    // Everything defaults to false — least privilege by default (spec: "Do
    // NOT give unrestricted company access by default").
    viewClientInfo: { type: Boolean, default: false },
    viewClientNotes: { type: Boolean, default: false },
    viewBrokerInfo: { type: Boolean, default: false },
    viewCompanyReports: { type: Boolean, default: false },
    viewVisitInfo: { type: Boolean, default: true }, // owners need this for their own properties by default
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      index: true,
    },

    // ── Identity (shared) ──────────────────────────────────
    name: { type: String, required: true, trim: true },
    mobile: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: [/^[0-9]{10}$/, 'Mobile number must be a 10-digit number'],
    },
    email: { type: String, trim: true, lowercase: true },
    gender: { type: String, enum: Object.values(GENDER) },
    profilePhotoUrl: { type: String },

    // ── Client-only optional profile (filled later via Profile Settings) ──
    currentLocation: { type: String },
    preferences: { type: Schema.Types.Mixed },

    // ── Internal-user auth (Broker / Owner-Caretaker / Admin) ─────────────
    passwordHash: { type: String, select: false }, // not used by Client (OTP-only)

    // ── Internal-user lifecycle ────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: function () {
        // Clients are active immediately after OTP verification.
        // Admin is only ever created via seed script (never public signup).
        // Broker / Owner-Caretaker require approval.
        return this.role === ROLES.CLIENT || this.role === ROLES.ADMIN
          ? ACCOUNT_STATUS.ACTIVE
          : ACCOUNT_STATUS.PENDING_APPROVAL;
      },
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String },

    // ── Owner/Caretaker specific ───────────────────────────────────────
    permissions: { type: permissionsSchema, default: () => ({}) },

    // ── Broker specific (kept light for V1) ────────────────────────────
    isActive: { type: Boolean, default: true }, // admin can deactivate without deleting

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, status: 1 });

// Never leak passwordHash even if a query forgets to exclude it.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
