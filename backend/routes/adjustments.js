const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createAdjustment,
  getAdjustments,
  getAdjustment,
  updateAdjustment,
  approveAdjustment,
  rejectAdjustment
} = require('../controllers/adjustmentsController');

// All roles that can access adjustments
router.route('/')
  .post(protect, authorize('Super Admin', 'Admin', 'Operator'), createAdjustment)
  .get(protect, authorize('Super Admin', 'Admin', 'Operator'), getAdjustments);

router.route('/:id')
  .get(protect, authorize('Super Admin', 'Admin', 'Operator'), getAdjustment)
  .put(protect, authorize('Super Admin', 'Admin'), updateAdjustment);

// Special endpoints
router.route('/:id/approve')
  .put(protect, authorize('Super Admin', 'Admin'), approveAdjustment);

router.route('/:id/reject')
  .put(protect, authorize('Super Admin', 'Admin'), rejectAdjustment);

module.exports = router;