const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createPrice,
  getPrices,
  getPrice,
  updatePrice
} = require('../controllers/pricesController');

// All roles that can access prices
router.route('/')
  .post(protect, authorize('Super Admin', 'Admin'), createPrice)
  .get(protect, authorize('Super Admin', 'Admin', 'Operator'), getPrices);

router.route('/:id')
  .get(protect, authorize('Super Admin', 'Admin', 'Operator'), getPrice)
  .put(protect, authorize('Super Admin', 'Admin'), updatePrice);

module.exports = router;