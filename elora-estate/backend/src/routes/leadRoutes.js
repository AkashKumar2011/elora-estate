const express = require('express');
const leads = require('../controllers/leadController');
const { requireAuth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

const router = express.Router();
router.use(requireAuth, authorize(ROLES.ADMIN, ROLES.BROKER));

router.get('/', leads.listMyLeads);
router.get('/client/:clientId', leads.getClientLead);
router.patch('/client/:clientId/next-action', leads.setNextAction);
router.patch('/client/:clientId/outcome', leads.setOutcome);
router.patch('/client/:clientId/deal', leads.recordDeal);
router.post('/client/:clientId/reassign', authorize(ROLES.ADMIN), leads.reassignLead);

module.exports = router;
