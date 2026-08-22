const express = require('express');
const dashboards = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

const router = express.Router();
router.use(requireAuth);

router.get('/admin', authorize(ROLES.ADMIN), dashboards.getAdminDashboard);
router.get('/broker', authorize(ROLES.BROKER), dashboards.getBrokerDashboard);
router.get('/client', authorize(ROLES.CLIENT), dashboards.getClientDashboard);
router.get('/owner', authorize(ROLES.OWNER_CARETAKER), dashboards.getOwnerDashboard);
router.get('/client-activity', authorize(ROLES.ADMIN, ROLES.BROKER), dashboards.getClientActivityList);

module.exports = router;
