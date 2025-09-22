const { Role } = require('../models');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private (Super Admin: full access, Admin: read-only)
const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    
    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles
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
  getRoles
};