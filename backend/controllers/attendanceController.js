const { Attendance, User, SPBU, sequelize } = require('../models');

// @desc    Check in
// @route   POST /api/attendance/check-in
// @access  Private (Operator: full, others: read-only)
const checkIn = async (req, res) => {
  try {
    // Check if user already has a check-in today without check-out
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingAttendance = await Attendance.findOne({
      where: {
        user_id: req.user.id,
        date: {
          [sequelize.Op.gte]: today,
          [sequelize.Op.lt]: tomorrow
        }
      }
    });
    
    if (existingAttendance && existingAttendance.check_in) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }
    
    let attendance;
    
    if (existingAttendance) {
      // Update existing record
      attendance = await existingAttendance.update({
        check_in: new Date(),
        spbu_id: req.user.spbu_id
      });
    } else {
      // Create new record
      attendance = await Attendance.create({
        user_id: req.user.id,
        spbu_id: req.user.spbu_id,
        check_in: new Date()
      });
    }
    
    // Get attendance with related data
    const attendanceWithDetails = await Attendance.findByPk(attendance.id, {
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: SPBU, attributes: ['name', 'code'] }
      ]
    });
    
    res.status(201).json({
      success: true,
      data: attendanceWithDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Check out
// @route   POST /api/attendance/check-out
// @access  Private (Operator: full, others: read-only)
const checkOut = async (req, res) => {
  try {
    // Find today's attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const attendance = await Attendance.findOne({
      where: {
        user_id: req.user.id,
        date: {
          [sequelize.Op.gte]: today,
          [sequelize.Op.lt]: tomorrow
        }
      }
    });
    
    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today'
      });
    }
    
    if (attendance.check_out) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today'
      });
    }
    
    // Update check-out time
    const updatedAttendance = await attendance.update({
      check_out: new Date()
    });
    
    // Get updated attendance with related data
    const attendanceWithDetails = await Attendance.findByPk(updatedAttendance.id, {
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: SPBU, attributes: ['name', 'code'] }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: attendanceWithDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private (Super Admin: read-only, Admin: read-only, Operator: limited)
const getAttendance = async (req, res) => {
  try {
    let attendanceRecords;
    
    const includeOptions = [
      { model: User, attributes: ['name', 'email'] },
      { model: SPBU, attributes: ['name', 'code'] }
    ];
    
    if (req.user.Role.name === 'Super Admin') {
      // Super Admin sees all attendance records
      attendanceRecords = await Attendance.findAll({ include: includeOptions });
    } else if (req.user.Role.name === 'Admin') {
      // Admin sees attendance records for their SPBU
      attendanceRecords = await Attendance.findAll({ 
        where: { spbu_id: req.user.spbu_id },
        include: includeOptions
      });
    } else if (req.user.Role.name === 'Operator') {
      // Operator sees only their own attendance records
      attendanceRecords = await Attendance.findAll({ 
        where: { user_id: req.user.id },
        include: includeOptions
      });
    }
    
    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getAttendance
};