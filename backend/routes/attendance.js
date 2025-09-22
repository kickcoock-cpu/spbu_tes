const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  checkIn,
  checkOut,
  getAttendance
} = require('../controllers/attendanceController');

// Operator can check in and out
router.route('/check-in')
  .post(protect, authorize('Operator'), checkIn);

router.route('/check-out')
  .post(protect, authorize('Operator'), checkOut);

// All roles can view attendance records
router.route('/')
  .get(protect, authorize('Super Admin', 'Admin', 'Operator'), getAttendance);

module.exports = router;