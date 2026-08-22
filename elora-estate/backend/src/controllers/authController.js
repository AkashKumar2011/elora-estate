const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Otp = require('../models/Otp');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');
const { generateOtpCode, hashOtp, compareOtp, getExpiryDate } = require('../utils/otp');
const { sendOtp } = require('../services/otpDeliveryService');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { ROLES, ACCOUNT_STATUS, GENDER } = require('../config/constants');

const MOBILE_RE = /^[0-9]{10}$/;

const REFRESH_COOKIE_NAME = 'elora_refresh_token';
const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30d — kept in sync conceptually with JWT_REFRESH_EXPIRES_IN default
  path: '/api/auth',
});

function issueTokens(res, user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  return accessToken;
}

// ─────────────────────────────────────────────────────────────────────────
// CLIENT AUTH — "User Login": Name → Gender → Mobile → OTP
// Per spec: no unnecessary profile info collected at first auth.
// ─────────────────────────────────────────────────────────────────────────

// Step 1: client submits name + gender + mobile → OTP is generated & "sent".
// If the mobile already belongs to an existing client, we don't ask for
// name/gender again — we just re-send an OTP for that existing account.
const requestClientOtp = asyncHandler(async (req, res) => {
  const { name, gender, mobile } = req.body;

  if (!MOBILE_RE.test(mobile || '')) {
    throw ApiError.badRequest('A valid 10-digit mobile number is required');
  }

  let user = await User.findOne({ mobile, role: ROLES.CLIENT });
  if (!user) {
    if (!name || !name.trim()) {
      throw ApiError.badRequest('Name is required for a new account');
    }
    if (gender && !Object.values(GENDER).includes(gender)) {
      throw ApiError.badRequest('Invalid gender value');
    }
    user = await User.create({ role: ROLES.CLIENT, name: name.trim(), gender, mobile });
  }

  const code = generateOtpCode();
  await Otp.create({ mobile, codeHash: await hashOtp(code), purpose: 'client_login', expiresAt: getExpiryDate() });
  const delivery = await sendOtp(mobile, code);

  res.status(200).json({
    message: 'OTP sent',
    isNewAccount: user.createdAt.getTime() === user.updatedAt.getTime(),
    devDelivery: delivery.mode === 'dev_console' ? delivery : undefined,
  });
});

// Step 2: verify the OTP, activate the session.
const verifyClientOtp = asyncHandler(async (req, res) => {
  const { mobile, code } = req.body;
  if (!MOBILE_RE.test(mobile || '') || !code) {
    throw ApiError.badRequest('Mobile number and OTP code are required');
  }

  const otpDoc = await Otp.findOne({ mobile, purpose: 'client_login', consumedAt: null })
    .sort({ createdAt: -1 });

  if (!otpDoc) {
    throw ApiError.badRequest('No pending OTP for this number — request a new one');
  }
  if (otpDoc.expiresAt < new Date()) {
    throw ApiError.badRequest('OTP has expired — request a new one');
  }

  const maxAttempts = Number(process.env.OTP_MAX_ATTEMPTS || 5);
  if (otpDoc.attempts >= maxAttempts) {
    throw ApiError.badRequest('Too many incorrect attempts — request a new OTP');
  }

  const isValid = await compareOtp(code, otpDoc.codeHash);
  if (!isValid) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    throw ApiError.badRequest('Incorrect OTP');
  }

  otpDoc.consumedAt = new Date();
  await otpDoc.save();

  const user = await User.findOne({ mobile, role: ROLES.CLIENT });
  if (!user) {
    throw ApiError.notFound('Account not found — restart login');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = issueTokens(res, user);
  res.status(200).json({ accessToken, user });
});

// ─────────────────────────────────────────────────────────────────────────
// INTERNAL AUTH — "Agent Login": role select (broker | owner_caretaker)
// → registration → Admin approval → activation → password login.
// Admin is never created via public signup (spec: "Admin must NOT be a
// public signup role") — only via the seed script.
// ─────────────────────────────────────────────────────────────────────────

const registerInternalUser = asyncHandler(async (req, res) => {
  const { role, name, mobile, email, password, gender } = req.body;

  if (![ROLES.BROKER, ROLES.OWNER_CARETAKER].includes(role)) {
    throw ApiError.badRequest('role must be "broker" or "owner_caretaker"');
  }
  if (!name || !name.trim()) throw ApiError.badRequest('Name is required');
  if (!MOBILE_RE.test(mobile || '')) throw ApiError.badRequest('A valid 10-digit mobile number is required');
  if (!password || password.length < 8) throw ApiError.badRequest('Password must be at least 8 characters');

  const existing = await User.findOne({ mobile });
  if (existing) throw ApiError.conflict('An account with this mobile number already exists');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    role,
    name: name.trim(),
    mobile,
    email,
    gender,
    passwordHash,
    // status defaults to 'pending_approval' via the User model for these roles
  });

  await logActivity({
    actor: null,
    action: 'user.registered',
    subjectType: 'user',
    subjectId: user._id,
    metadata: { role },
  });

  res.status(201).json({
    message: 'Registration submitted. Your account is pending Admin approval.',
    user,
  });
});

// Password login for internal users (broker / owner_caretaker / admin).
const internalLogin = asyncHandler(async (req, res) => {
  const { mobile, password } = req.body;
  if (!MOBILE_RE.test(mobile || '') || !password) {
    throw ApiError.badRequest('Mobile number and password are required');
  }

  const user = await User.findOne({ mobile, role: { $ne: ROLES.CLIENT } }).select('+passwordHash');
  if (!user || !user.passwordHash) {
    throw ApiError.unauthorized('Invalid mobile number or password');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw ApiError.unauthorized('Invalid mobile number or password');
  }

  if (user.status === ACCOUNT_STATUS.PENDING_APPROVAL) {
    throw ApiError.forbidden('Your account is still pending Admin approval');
  }
  if (user.status === ACCOUNT_STATUS.REJECTED) {
    throw ApiError.forbidden('Your registration was not approved');
  }
  if (user.status === ACCOUNT_STATUS.DEACTIVATED) {
    throw ApiError.forbidden('This account has been deactivated');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = issueTokens(res, user);
  res.status(200).json({ accessToken, user });
});

// ─────────────────────────────────────────────────────────────────────────
// SHARED: refresh / logout / me
// ─────────────────────────────────────────────────────────────────────────

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) throw ApiError.unauthorized('No refresh token');

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(payload.sub);
  if (!user || user.status !== ACCOUNT_STATUS.ACTIVE) {
    throw ApiError.unauthorized('Account is not active');
  }

  const accessToken = issueTokens(res, user);
  res.status(200).json({ accessToken });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  res.status(200).json({ message: 'Logged out' });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = {
  requestClientOtp,
  verifyClientOtp,
  registerInternalUser,
  internalLogin,
  refresh,
  logout,
  me,
};
