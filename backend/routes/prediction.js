const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSalesPrediction,
  getDeliveryPrediction,
  getDemandPrediction,
  getStockoutPrediction
} = require('../controllers/predictionController');

// Only Super Admin and Admin can access predictions
router.route('/sales')
  .get(protect, authorize('Super Admin', 'Admin'), getSalesPrediction);

router.route('/deliveries')
  .get(protect, authorize('Super Admin', 'Admin'), getDeliveryPrediction);

router.route('/demand')
  .get(protect, authorize('Super Admin', 'Admin'), getDemandPrediction);

router.route('/stockout')
  .get(protect, authorize('Super Admin', 'Admin'), getStockoutPrediction);

module.exports = router;