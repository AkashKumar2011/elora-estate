const express = require('express');
const requirements = require('../controllers/requirementController');
const { requireAuth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

const router = express.Router();

const canCapture = authorize(ROLES.ADMIN, ROLES.BROKER);

router.post('/', requireAuth, canCapture, requirements.createRequirement);
router.patch('/:id', requireAuth, canCapture, requirements.updateRequirement);
router.get('/client/:clientId', requireAuth, canCapture, requirements.getClientRequirements);

// Client's own view of their active requirement + current matches.
router.get('/me/matches', requireAuth, authorize(ROLES.CLIENT), requirements.getMyRequirementMatches);

module.exports = router;
