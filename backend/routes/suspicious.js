const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSuspiciousTransactions
} = require('../controllers/suspiciousTransactionsController');

// Only Super Admin and Admin can access suspicious transactions monitoring
router.route('/suspicious')
  .get(protect, authorize('Super Admin', 'Admin'), getSuspiciousTransactions);

module.exports = router;