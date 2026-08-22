const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// 6-digit numeric OTP. Never stored or logged in plaintext outside of the
// explicit OTP_DEV_BYPASS development path.
function generateOtpCode() {
  return crypto.randomInt(100000, 999999).toString();
}

async function hashOtp(code) {
  return bcrypt.hash(code, 10);
}

async function compareOtp(code, hash) {
  return bcrypt.compare(code, hash);
}

function getExpiryDate() {
  const minutes = Number(process.env.OTP_EXPIRES_MINUTES || 5);
  return new Date(Date.now() + minutes * 60 * 1000);
}

module.exports = { generateOtpCode, hashOtp, compareOtp, getExpiryDate };
