const express = require('express');
const reports = require('../controllers/reportController');
const { requireAuth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

const router = express.Router();
router.use(requireAuth, authorize(ROLES.ADMIN));

router.get('/broker-performance', reports.getBrokerPerformanceReport);
router.get('/business-summary', reports.getBusinessSummaryReport);

module.exports = router;
