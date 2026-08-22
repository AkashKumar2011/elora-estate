// Run with: npm run seed:admin
// Creates (or confirms) the first Admin account from env vars. This is the
// ONLY way an Admin account is created — there is no public/API path to it,
// per spec ("Admin must NOT be a public signup role").
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const { ROLES } = require('../config/constants');

async function seedAdmin() {
  await connectDB();

  const mobile = process.env.SEED_ADMIN_MOBILE;
  const name = process.env.SEED_ADMIN_NAME || 'Admin';
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!mobile || !password) {
    console.error('[seed:admin] SEED_ADMIN_MOBILE and SEED_ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }
  if (password === 'change_me_immediately') {
    console.warn('[seed:admin] WARNING: using the default placeholder password. Change SEED_ADMIN_PASSWORD before running in any shared environment.');
  }

  const existing = await User.findOne({ mobile, role: ROLES.ADMIN });
  if (existing) {
    console.log(`[seed:admin] Admin account already exists for ${mobile} — no changes made.`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await User.create({ role: ROLES.ADMIN, name, mobile, passwordHash });

  console.log(`[seed:admin] Admin account created: ${admin.name} (${admin.mobile})`);
  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error('[seed:admin] Failed:', err);
  process.exit(1);
});
