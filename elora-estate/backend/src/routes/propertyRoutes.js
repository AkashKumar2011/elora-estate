const express = require('express');
const properties = require('../controllers/propertyController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

const router = express.Router();

const canManageProperties = authorize(ROLES.ADMIN, ROLES.BROKER, ROLES.OWNER_CARETAKER);

// ── Public ──────────────────────────────────────────────────────────────
router.get('/', optionalAuth, properties.listPublicProperties);
router.get('/:id', optionalAuth, properties.getPublicProperty);

// ── Internal ────────────────────────────────────────────────────────────
router.get('/internal/list', requireAuth, canManageProperties, properties.listInternalProperties);
router.get('/:id/internal', requireAuth, canManageProperties, properties.getInternalProperty);
router.get('/:id/matches', requireAuth, canManageProperties, properties.getPropertyMatches);

router.post('/', requireAuth, canManageProperties, properties.createProperty);
router.patch('/:id', requireAuth, canManageProperties, properties.updateProperty);
router.post('/:id/publish', requireAuth, canManageProperties, properties.publishProperty);
router.post('/:id/hide', requireAuth, canManageProperties, properties.hideProperty);
router.post('/:id/archive', requireAuth, authorize(ROLES.ADMIN), properties.archiveProperty);

module.exports = router;
