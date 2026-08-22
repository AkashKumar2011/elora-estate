const express = require('express');
const visits = require('../controllers/visitController');
const { requireAuth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.post('/', requireAuth, authorize(ROLES.CLIENT, ROLES.BROKER, ROLES.ADMIN), visits.scheduleVisit);
router.post('/:id/reschedule', requireAuth, authorize(ROLES.CLIENT, ROLES.BROKER, ROLES.ADMIN), visits.rescheduleVisit);
router.post('/:id/cancel', requireAuth, authorize(ROLES.CLIENT, ROLES.BROKER, ROLES.ADMIN), visits.cancelVisit);
router.post('/:id/outcome', requireAuth, authorize(ROLES.BROKER, ROLES.ADMIN), visits.recordVisitOutcome);

router.get('/mine', requireAuth, authorize(ROLES.CLIENT, ROLES.BROKER), visits.listMyVisits);
router.get('/', requireAuth, authorize(ROLES.ADMIN), visits.listAllVisits);

module.exports = router;
