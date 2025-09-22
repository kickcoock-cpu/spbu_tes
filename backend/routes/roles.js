const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { getRoles } = require('../controllers/roleController');

// Get all roles
router.route('/')
  .get(protect, authorize('Super Admin', 'Admin'), getRoles);

module.exports = router;