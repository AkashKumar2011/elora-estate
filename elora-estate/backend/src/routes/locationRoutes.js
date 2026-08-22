const express = require('express');
const locations = require('../controllers/locationController');
const { requireAuth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.get('/', locations.listActiveLocations);

router.get('/all', requireAuth, authorize(ROLES.ADMIN), locations.listAllLocations);
router.post('/', requireAuth, authorize(ROLES.ADMIN), locations.createLocation);
router.patch('/:id', requireAuth, authorize(ROLES.ADMIN), locations.setLocationActive);

module.exports = router;
