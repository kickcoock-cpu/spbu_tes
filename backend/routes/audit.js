const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAudits,
  getAudit
} = require('../controllers/auditController');

// Only Super Admin and Admin can access audit logs
router.route('/')
  .get(protect, authorize('Super Admin', 'Admin'), getAudits);

router.route('/:id')
  .get(protect, authorize('Super Admin', 'Admin'), getAudit);

module.exports = router;