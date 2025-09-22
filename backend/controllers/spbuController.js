const { SPBU } = require('../models');

// @desc    Create SPBU
// @route   POST /api/spbu
// @access  Private (Super Admin only)
const createSPBU = async (req, res) => {
  try {
    // Only Super Admin can create SPBU
    if (req.user.Role.name !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Super Admin can create SPBU.'
      });
    }
    
    const { name, location, code } = req.body;

    // Check if SPBU with this code already exists
    const spbuExists = await SPBU.findOne({ where: { code } });

    if (spbuExists) {
      return res.status(400).json({
        success: false,
        message: 'SPBU with this code already exists'
      });
    }

    // Create SPBU
    const spbu = await SPBU.create({
      name,
      location,
      code
    });

    res.status(201).json({
      success: true,
      data: spbu
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all SPBUs
// @route   GET /api/spbu
// @access  Private (Super Admin: full access, Admin: read-only)
const getSPBUs = async (req, res) => {
  try {
    let spbus;
    
    if (req.user.Role.name === 'Super Admin') {
      // Super Admin sees all SPBUs
      spbus = await SPBU.findAll();
    } else if (req.user.Role.name === 'Admin') {
      // Admin only sees their own SPBU
      spbus = await SPBU.findAll({
        where: {
          id: req.user.spbu_id
        }
      });
    } else {
      // For other roles (e.g., Operator), return empty array or specific permission error
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    
    res.status(200).json({
      success: true,
      count: spbus.length,
      data: spbus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single SPBU
// @route   GET /api/spbu/:id
// @access  Private (Super Admin: full access, Admin: read-only)
const getSPBU = async (req, res) => {
  try {
    const spbu = await SPBU.findByPk(req.params.id);

    if (!spbu) {
      return res.status(404).json({
        success: false,
        message: 'SPBU not found'
      });
    }
    
    // Check permissions for Admin role
    if (req.user.Role.name === 'Admin' && spbu.id !== req.user.spbu_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own SPBU.'
      });
    }

    res.status(200).json({
      success: true,
      data: spbu
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update SPBU
// @route   PUT /api/spbu/:id
// @access  Private (Super Admin only)
const updateSPBU = async (req, res) => {
  try {
    // Only Super Admin can update SPBU
    if (req.user.Role.name !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Super Admin can update SPBU.'
      });
    }
    
    const spbu = await SPBU.findByPk(req.params.id);

    if (!spbu) {
      return res.status(404).json({
        success: false,
        message: 'SPBU not found'
      });
    }

    // Update SPBU
    await spbu.update(req.body);

    res.status(200).json({
      success: true,
      data: spbu
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete SPBU
// @route   DELETE /api/spbu/:id
// @access  Private (Super Admin only)
const deleteSPBU = async (req, res) => {
  try {
    // Only Super Admin can delete SPBU
    if (req.user.Role.name !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Super Admin can delete SPBU.'
      });
    }
    
    const spbu = await SPBU.findByPk(req.params.id);

    if (!spbu) {
      return res.status(404).json({
        success: false,
        message: 'SPBU not found'
      });
    }

    await spbu.destroy();

    res.status(200).json({
      success: true,
      message: 'SPBU removed'
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
  createSPBU,
  getSPBUs,
  getSPBU,
  updateSPBU,
  deleteSPBU
};