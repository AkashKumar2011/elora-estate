const CartItem = require('../models/CartItem');
const Property = require('../models/Property');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logActivity = require('../utils/logActivity');
const { PROPERTY_STATUS } = require('../config/constants');

// All handlers here run only as the authenticated Client (see routes) —
// there is no broker/admin write path into a client's cart, per spec:
// "Cart and Lineup are NOT the same feature."

const addToCart = asyncHandler(async (req, res) => {
  const { propertyId } = req.body;
  if (!propertyId) throw ApiError.badRequest('propertyId is required');

  const property = await Property.findOne({ _id: propertyId, status: PROPERTY_STATUS.PUBLISHED });
  if (!property) throw ApiError.notFound('Property not found or not currently published');

  let item;
  try {
    item = await CartItem.create({ client: req.user._id, property: propertyId });
  } catch (err) {
    if (err.code === 11000) {
      // Already in cart — idempotent, not an error.
      item = await CartItem.findOne({ client: req.user._id, property: propertyId });
      return res.status(200).json({ item, alreadyInCart: true });
    }
    throw err;
  }

  await logActivity({
    actor: req.user._id,
    action: 'cart.property_added',
    subjectType: 'property',
    subjectId: propertyId,
    relatedClient: req.user._id,
  });

  res.status(201).json({ item });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const item = await CartItem.findOneAndDelete({ client: req.user._id, property: req.params.propertyId });
  if (!item) throw ApiError.notFound('Item not found in your cart');

  await logActivity({
    actor: req.user._id,
    action: 'cart.property_removed',
    subjectType: 'property',
    subjectId: req.params.propertyId,
    relatedClient: req.user._id,
  });

  res.status(200).json({ message: 'Removed from cart' });
});

const listMyCart = asyncHandler(async (req, res) => {
  const items = await CartItem.find({ client: req.user._id }).populate('property').sort({ createdAt: -1 });
  const properties = items
    .filter((i) => i.property) // property may have been deleted/archived
    .map((i) => ({ addedAt: i.createdAt, ...i.property.toPublicJSON() }));
  res.status(200).json({ properties });
});

module.exports = { addToCart, removeFromCart, listMyCart };
