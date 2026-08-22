const Location = require('../models/Location');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Public — used to populate the location filter on the public site.
const listActiveLocations = asyncHandler(async (req, res) => {
  const locations = await Location.find({ isActive: true }).sort({ name: 1 });
  res.status(200).json({ locations: locations.map((l) => l.name) });
});

// Admin-only management.
const listAllLocations = asyncHandler(async (req, res) => {
  const locations = await Location.find().sort({ name: 1 });
  res.status(200).json({ locations });
});

const createLocation = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) throw ApiError.badRequest('name is required');

  const existing = await Location.findOne({ name: name.trim() });
  if (existing) throw ApiError.conflict('This location already exists');

  const location = await Location.create({ name: name.trim() });
  res.status(201).json({ location });
});

const setLocationActive = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const location = await Location.findById(req.params.id);
  if (!location) throw ApiError.notFound('Location not found');
  location.isActive = Boolean(isActive);
  await location.save();
  res.status(200).json({ location });
});

module.exports = { listActiveLocations, listAllLocations, createLocation, setLocationActive };
