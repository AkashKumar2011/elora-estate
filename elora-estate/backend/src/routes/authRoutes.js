const express = require('express');
const rateLimit = require('express-rate-limit');
const auth = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// OTP endpoints are the most abuse-prone in the whole API (SMS-pumping,
// brute-forcing a 6-digit code) — rate-limit them specifically, tighter
// than any general API limiter.
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: { message: 'Too many OTP requests. Try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
});
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: { message: 'Too many OTP verification attempts. Try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: { message: 'Too many login attempts. Try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

// Client — "User Login"
router.post('/client/otp/request', otpRequestLimiter, auth.requestClientOtp);
router.post('/client/otp/verify', otpVerifyLimiter, auth.verifyClientOtp);

// Internal — "Agent Login" (role: broker | owner_caretaker)
router.post('/internal/register', auth.registerInternalUser);
router.post('/internal/login', loginLimiter, auth.internalLogin);

// Shared
router.post('/refresh', auth.refresh);
router.post('/logout', auth.logout);
router.get('/me', requireAuth, auth.me);

module.exports = router;
