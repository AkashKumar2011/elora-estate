const express = require('express');
const followUps = require('../controllers/followUpController');
const { requireAuth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

const router = express.Router();
router.use(requireAuth, authorize(ROLES.ADMIN, ROLES.BROKER));

router.get('/dashboard', followUps.getDashboardBuckets);
router.post('/', followUps.createFollowUp);
router.post('/:id/complete', followUps.completeFollowUp);
router.post('/:id/snooze', followUps.snoozeFollowUp);

module.exports = router;
