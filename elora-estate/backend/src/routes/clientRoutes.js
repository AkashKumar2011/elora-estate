const express = require('express');
const clients = require('../controllers/clientController');
const { requireAuth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

const router = express.Router();
router.use(requireAuth, authorize(ROLES.ADMIN, ROLES.BROKER));

router.get('/', clients.listClients);
router.post('/', clients.createClient);
router.get('/:clientId/crm-summary', clients.getClientCrmSummary);

module.exports = router;
