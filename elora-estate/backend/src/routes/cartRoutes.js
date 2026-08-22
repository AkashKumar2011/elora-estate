const express = require('express');
const cart = require('../controllers/cartController');
const { requireAuth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

const router = express.Router();
router.use(requireAuth, authorize(ROLES.CLIENT));

router.get('/', cart.listMyCart);
router.post('/', cart.addToCart);
router.delete('/:propertyId', cart.removeFromCart);

module.exports = router;
