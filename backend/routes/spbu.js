const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createSPBU,
  getSPBUs,
  getSPBU,
  updateSPBU,
  deleteSPBU
} = require('../controllers/spbuController');

// Protected routes
router.route('/')
  .post(protect, authorize('Super Admin'), createSPBU)
  .get(protect, authorize('Super Admin', 'Admin'), getSPBUs);

router.route('/:id')
  .get(protect, authorize('Super Admin', 'Admin'), getSPBU)
  .put(protect, authorize('Super Admin'), updateSPBU)
  .delete(protect, authorize('Super Admin'), deleteSPBU);

module.exports = router;