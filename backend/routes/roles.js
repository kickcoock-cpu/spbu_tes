const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getRoles } = require('../controllers/roleController');

// Get all roles
router.route('/')
  .get(protect, authorize('Super Admin', 'Admin'), getRoles);

module.exports = router;