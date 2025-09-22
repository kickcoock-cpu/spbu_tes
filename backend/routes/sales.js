const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSales,
  getSale,
  createSale,
  getSalesByOperator // Tambahkan ini
} = require('../controllers/salesController');

// All roles that can access sales
router.route('/')
  .post(protect, authorize('Operator'), createSale)
  .get(protect, authorize('Super Admin', 'Admin', 'Operator'), getSales);

// Special endpoint for filtering by operator
router.route('/by-operator/:operatorId')
  .get(protect, authorize('Super Admin', 'Admin'), getSalesByOperator);

router.route('/:id')
  .get(protect, authorize('Super Admin', 'Admin', 'Operator'), getSale);

module.exports = router;