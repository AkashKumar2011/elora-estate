const express = require('express');
const lineup = require('../controllers/lineupController');
const { requireAuth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

const router = express.Router();
const canManage = authorize(ROLES.ADMIN, ROLES.BROKER);

router.get('/:clientId', requireAuth, canManage, lineup.getClientLineup);
router.post('/:clientId/items', requireAuth, canManage, lineup.addPropertyToLineup);
router.patch('/:clientId/items/:itemId', requireAuth, canManage, lineup.updateLineupItemStatus);
router.delete('/:clientId/items/:itemId', requireAuth, canManage, lineup.removePropertyFromLineup);

module.exports = router;
