const express = require('express');
const adminUsers = require('../controllers/adminUserController');
const { requireAuth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(requireAuth, authorize(ROLES.ADMIN));

router.get('/', adminUsers.listInternalUsers);
router.post('/:userId/approve', adminUsers.approveUser);
router.post('/:userId/reject', adminUsers.rejectUser);
router.post('/:userId/deactivate', adminUsers.deactivateUser);
router.post('/:userId/reactivate', adminUsers.reactivateUser);
router.patch('/:userId/role', adminUsers.changeRole);
router.patch('/:userId/permissions', adminUsers.updatePermissions);

module.exports = router;
