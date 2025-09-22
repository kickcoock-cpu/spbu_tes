const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getLedgerReport,
  addLedgerEntry,
  verifyLedgerBalanceConsistency,
  recalculateLedgerBalances
} = require('../controllers/ledgerController');

// All roles that can access ledger reports
router.route('/')
  .get(protect, authorize('Super Admin', 'Admin', 'Operator'), (req, res) => {
    console.log('Ledger report route hit with query params:', req.query);
    getLedgerReport(req, res);
  })
  .post(protect, authorize('Super Admin', 'Admin'), (req, res) => {
    console.log('Add ledger entry route hit with body:', req.body);
    addLedgerEntry(req, res);
  });

// Routes for verifying and recalculating ledger balances
router.route('/verify')
  .get(protect, authorize('Super Admin', 'Admin'), (req, res) => {
    console.log('Verify ledger balance route hit with query params:', req.query);
    verifyLedgerBalanceConsistency(req, res);
  });

router.route('/recalculate')
  .post(protect, authorize('Super Admin', 'Admin'), (req, res) => {
    console.log('Recalculate ledger balances route hit with body:', req.body);
    recalculateLedgerBalances(req, res);
  });

module.exports = router;