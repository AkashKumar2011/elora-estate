const express = require('express');
const notes = require('../controllers/noteController');
const { requireAuth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

const router = express.Router();
router.use(requireAuth, authorize(ROLES.ADMIN, ROLES.BROKER, ROLES.OWNER_CARETAKER));

router.post('/', notes.createNote);
router.get('/client/:clientId', notes.listClientNotes);
router.get('/property/:propertyId', notes.listPropertyNotes);

module.exports = router;
