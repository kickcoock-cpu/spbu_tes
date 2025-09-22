const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getDashboard } = require('../controllers/dashboardController');

// Only Super Admin and Admin can access dashboard
router.route('/')
  .get(protect, authorize('Super Admin', 'Admin'), getDashboard);

module.exports = router;