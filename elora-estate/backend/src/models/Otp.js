const mongoose = require('mongoose');
const { Schema } = mongoose;

const otpSchema = new Schema(
  {
    mobile: { type: String, required: true, index: true },
    codeHash: { type: String, required: true }, // never store OTP in plaintext
    purpose: { type: String, enum: ['client_login'], default: 'client_login' },
    attempts: { type: Number, default: 0 },
    consumedAt: { type: Date },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index — auto-cleans expired docs
  },
  { timestamps: true }
);

module.exports = mongoose.model('Otp', otpSchema);
