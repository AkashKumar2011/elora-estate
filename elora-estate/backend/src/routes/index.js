const express = require('express');
const authRoutes = require('./authRoutes');
const adminUserRoutes = require('./adminUserRoutes');
const propertyRoutes = require('./propertyRoutes');
const requirementRoutes = require('./requirementRoutes');
const locationRoutes = require('./locationRoutes');
const cartRoutes = require('./cartRoutes');
const lineupRoutes = require('./lineupRoutes');
const visitRoutes = require('./visitRoutes');
const followUpRoutes = require('./followUpRoutes');
const noteRoutes = require('./noteRoutes');
const leadRoutes = require('./leadRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const activityRoutes = require('./activityRoutes');
const clientRoutes = require('./clientRoutes');
const reportRoutes = require('./reportRoutes');

const router = express.Router();

router.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'eloraestate-backend' }));

router.use('/auth', authRoutes);
router.use('/admin/users', adminUserRoutes);
router.use('/properties', propertyRoutes);
router.use('/requirements', requirementRoutes);
router.use('/locations', locationRoutes);
router.use('/cart', cartRoutes);
router.use('/lineups', lineupRoutes);
router.use('/visits', visitRoutes);
router.use('/follow-ups', followUpRoutes);
router.use('/notes', noteRoutes);
router.use('/leads', leadRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/activity', activityRoutes);
router.use('/clients', clientRoutes);
router.use('/reports', reportRoutes);

// Backend V1 feature set is now complete per the verified requirements.
// Remaining work: the React frontend.

module.exports = router;
