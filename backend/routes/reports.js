const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSalesReport,
  getDeliveryReport,
  getDepositReport,
  getAttendanceReport,
  getAdjustmentReport
} = require('../controllers/reportsController');

// All roles that can access reports
router.route('/sales')
  .get(protect, authorize('Super Admin', 'Admin', 'Operator'), (req, res) => {
    console.log('Sales report route hit with query params:', req.query);
    getSalesReport(req, res);
  });

router.route('/deliveries')
  .get(protect, authorize('Super Admin', 'Admin', 'Operator'), (req, res) => {
    console.log('Delivery report route hit with query params:', req.query);
    getDeliveryReport(req, res);
  });

router.route('/deposits')
  .get(protect, authorize('Super Admin', 'Admin', 'Operator'), (req, res) => {
    console.log('Deposit report route hit with query params:', req.query);
    getDepositReport(req, res);
  });

router.route('/attendance')
  .get(protect, authorize('Super Admin', 'Admin', 'Operator'), (req, res) => {
    console.log('Attendance report route hit with query params:', req.query);
    getAttendanceReport(req, res);
  });

router.route('/adjustments')
  .get(protect, authorize('Super Admin', 'Admin'), (req, res) => {
    console.log('Adjustment report route hit with query params:', req.query);
    getAdjustmentReport(req, res);
  });

module.exports = router;