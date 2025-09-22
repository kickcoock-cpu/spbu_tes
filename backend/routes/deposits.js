const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createDeposit,
  getDeposits,
  getDeposit,
  updateDeposit,
  approveDeposit,
  rejectDeposit
} = require('../controllers/depositsController');

// All roles that can access deposits
router.route('/')
  .post(protect, authorize('Super Admin', 'Admin', 'Operator'), createDeposit)
  .get(protect, authorize('Super Admin', 'Admin', 'Operator'), getDeposits);

router.route('/:id')
  .get(protect, authorize('Super Admin', 'Admin', 'Operator'), getDeposit)
  .put(protect, authorize('Super Admin', 'Admin'), updateDeposit);

// Special endpoints
router.route('/:id/approve')
  .put(protect, authorize('Super Admin', 'Admin'), approveDeposit);

router.route('/:id/reject')
  .put(protect, authorize('Super Admin', 'Admin'), rejectDeposit);

module.exports = router;