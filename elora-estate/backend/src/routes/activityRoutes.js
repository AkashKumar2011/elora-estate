const express = require('express');
const activity = require('../controllers/activityController');
const { requireAuth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.get(
  '/client/:clientId',
  requireAuth,
  authorize(ROLES.ADMIN, ROLES.BROKER, ROLES.CLIENT),
  activity.getClientTimeline
);

module.exports = router;
