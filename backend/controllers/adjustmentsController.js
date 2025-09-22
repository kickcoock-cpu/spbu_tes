const { Adjustment, SPBU, User, Tank } = require('../models');
const { recordAdjustmentTransaction } = require('../utils/ledgerUtils');

// @desc    Create adjustment request
// @route   POST /api/adjustments
// @access  Private (Super Admin: full, Admin: full, Operator: limited)
const createAdjustment = async (req, res) => {
  try {
    const { type, description, tankId, adjustmentType, quantity } = req.body;
    
    // Validate required fields
    if (!type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type and description'
      });
    }
    
    // For fuel adjustments, validate tank-related fields
    if (type === 'fuel') {
      if (!tankId || !adjustmentType || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'For fuel adjustments, please provide tank, adjustment type, and quantity'
      });
      }
    }
    
    // Get user's SPBU
    const spbuId = req.user.Role.name === 'Super Admin' ? req.body.spbu_id : req.user.spbu_id;
    
    if (!spbuId) {
      return res.status(400).json({
        success: false,
        message: 'User must be assigned to an SPBU'
      });
    }
    
    // Create adjustment
    const adjustment = await Adjustment.create({
      spbu_id: spbuId,
      operator_id: req.user.Role.name === 'Operator' ? req.user.id : null,
      type,
      description,
      tank_id: tankId,
      adjustment_type: adjustmentType,
      quantity: type === 'fuel' ? quantity : null
    });
    
    // Check if user has permission to access tanks
    const hasTankPermission = req.user.Role.name === 'Super Admin' || req.user.Role.name === 'Admin';
    
    // Prepare include options for adjustment details
    const includeOptions = [
      { model: SPBU, attributes: ['name', 'code'] },
      { model: User, as: 'operator', attributes: ['name'] },
      { model: User, as: 'adjustment_approver', attributes: ['name'] },
      { model: User, as: 'adjustment_rejector', attributes: ['name'] }
    ];
    
    // Only include tank information if user has permission
    if (hasTankPermission) {
      includeOptions.push({ model: Tank, attributes: ['name', 'fuel_type'] });
    }
    
    // Get adjustment with related data
    const adjustmentWithDetails = await Adjustment.findByPk(adjustment.id, {
      include: includeOptions
    });
    
    res.status(201).json({
      success: true,
      data: adjustmentWithDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all adjustments
// @route   GET /api/adjustments
// @access  Private (Super Admin: full, Admin: full, Operator: read-only)
const getAdjustments = async (req, res) => {
  try {
    let adjustments;
    
    // Check if user has permission to access tanks
    const hasTankPermission = req.user.Role.name === 'Super Admin' || req.user.Role.name === 'Admin';
    
    const includeOptions = [
      { model: SPBU, attributes: ['name', 'code'] },
      { model: User, as: 'operator', attributes: ['name'] },
      { model: User, as: 'adjustment_approver', attributes: ['name'] },
      { model: User, as: 'adjustment_rejector', attributes: ['name'] }
    ];
    
    // Only include tank information if user has permission
    if (hasTankPermission) {
      includeOptions.push({ model: Tank, attributes: ['name', 'fuel_type'] });
    }
    
    if (req.user.Role.name === 'Super Admin') {
      // Super Admin sees all adjustments
      adjustments = await Adjustment.findAll({ include: includeOptions });
    } else if (req.user.Role.name === 'Admin') {
      // Admin sees only adjustments from their SPBU
      adjustments = await Adjustment.findAll({ 
        where: { spbu_id: req.user.spbu_id },
        include: includeOptions
      });
    } else if (req.user.Role.name === 'Operator') {
      // Operator sees only their own adjustments
      adjustments = await Adjustment.findAll({ 
        where: { operator_id: req.user.id },
        include: includeOptions
      });
    }
    
    res.status(200).json({
      success: true,
      count: adjustments.length,
      data: adjustments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single adjustment
// @route   GET /api/adjustments/:id
// @access  Private (Super Admin: full, Admin: full, Operator: read-only)
const getAdjustment = async (req, res) => {
  try {
    // Check if user has permission to access tanks
    const hasTankPermission = req.user.Role.name === 'Super Admin' || req.user.Role.name === 'Admin';
    
    const includeOptions = [
      { model: SPBU, attributes: ['name', 'code'] },
      { model: User, as: 'operator', attributes: ['name'] },
      { model: User, as: 'adjustment_approver', attributes: ['name'] },
      { model: User, as: 'adjustment_rejector', attributes: ['name'] }
    ];
    
    // Only include tank information if user has permission
    if (hasTankPermission) {
      includeOptions.push({ model: Tank, attributes: ['name', 'fuel_type'] });
    }
    
    const adjustment = await Adjustment.findByPk(req.params.id, {
      include: includeOptions
    });
    
    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: 'Adjustment not found'
      });
    }
    
    // Check if user has permission to view this adjustment
    if (req.user.Role.name === 'Admin' && adjustment.spbu_id !== req.user.spbu_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this adjustment'
      });
    }
    
    // Operators can only view their own adjustments
    if (req.user.Role.name === 'Operator' && adjustment.operator_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this adjustment'
      });
    }
    
    res.status(200).json({
      success: true,
      data: adjustment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update adjustment
// @route   PUT /api/adjustments/:id
// @access  Private (Super Admin: full, Admin: full, Operator: none)
const updateAdjustment = async (req, res) => {
  try {
    const { type, description } = req.body;
    
    let adjustment = await Adjustment.findByPk(req.params.id);
    
    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: 'Adjustment not found'
      });
    }
    
    // Check if user has permission to update this adjustment
    if (req.user.Role.name === 'Admin' && adjustment.spbu_id !== req.user.spbu_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this adjustment'
      });
    }
    
    // Update adjustment
    adjustment.type = type || adjustment.type;
    adjustment.description = description || adjustment.description;
    adjustment = await adjustment.save();
    
    // Check if user has permission to access tanks
    const hasTankPermission = req.user.Role.name === 'Super Admin' || req.user.Role.name === 'Admin';
    
    // Prepare include options for adjustment details
    const includeOptions = [
      { model: SPBU, attributes: ['name', 'code'] },
      { model: User, as: 'operator', attributes: ['name'] },
      { model: User, as: 'adjustment_approver', attributes: ['name'] },
      { model: User, as: 'adjustment_rejector', attributes: ['name'] }
    ];
    
    // Only include tank information if user has permission
    if (hasTankPermission) {
      includeOptions.push({ model: Tank, attributes: ['name', 'fuel_type'] });
    }
    
    // Get updated adjustment with related data
    const updatedAdjustment = await Adjustment.findByPk(adjustment.id, {
      include: includeOptions
    });
    
    res.status(200).json({
      success: true,
      data: updatedAdjustment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Approve adjustment
// @route   PUT /api/adjustments/:id/approve
// @access  Private (Super Admin: full, Admin: full, Operator: none)
// FUNCTION: APPROVE_ADJUSTMENT
const approveAdjustment = async (req, res) => {
  try {
    let adjustment = await Adjustment.findByPk(req.params.id);
    
    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: 'Adjustment not found'
      });
    }
    
    // Check if user has permission to approve this adjustment
    if (req.user.Role.name === 'Admin' && adjustment.spbu_id !== req.user.spbu_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this adjustment'
      });
    }
    
    // Update adjustment status to approved
    adjustment.status = 'approved';
    adjustment.approved_by = req.user.id;
    adjustment = await adjustment.save();
    
    // If this is an approved fuel adjustment, update tank stock
    if (adjustment.type === 'fuel' && adjustment.tank_id && adjustment.adjustment_type && adjustment.quantity) {
      const tank = await Tank.findByPk(adjustment.tank_id);
      if (tank) {
        if (adjustment.adjustment_type === 'gain') {
          // Increase tank stock for gains
          tank.current_stock = parseFloat(tank.current_stock) + parseFloat(adjustment.quantity);
        } else if (adjustment.adjustment_type === 'loss') {
          // Decrease tank stock for losses
          tank.current_stock = parseFloat(tank.current_stock) - parseFloat(adjustment.quantity);
        }
        await tank.save();
      }
    }
    
    // Check if user has permission to access tanks
    const hasTankPermission = req.user.Role.name === 'Super Admin' || req.user.Role.name === 'Admin';
    
    // Prepare include options for adjustment details
    const includeOptions = [
      { model: SPBU, attributes: ['name', 'code'] },
      { model: User, as: 'operator', attributes: ['name'] },
      { model: User, as: 'adjustment_approver', attributes: ['name'] },
      { model: User, as: 'adjustment_rejector', attributes: ['name'] }
    ];
    
    // Only include tank information if user has permission
    if (hasTankPermission) {
      includeOptions.push({ model: Tank, attributes: ['name', 'fuel_type'] });
    }
    
    // Get updated adjustment with related data
    const updatedAdjustment = await Adjustment.findByPk(adjustment.id, {
      include: includeOptions
    });
    
    // Record adjustment transaction in ledger
    await recordAdjustmentTransactionHelper(adjustment, 'approved', req.user.id);
    
    res.status(200).json({
      success: true,
      data: updatedAdjustment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Reject adjustment
// @route   PUT /api/adjustments/:id/reject
// @access  Private (Super Admin: full, Admin: full, Operator: none)
// FUNCTION: REJECT_ADJUSTMENT
const rejectAdjustment = async (req, res) => {
  try {
    let adjustment = await Adjustment.findByPk(req.params.id);
    
    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: 'Adjustment not found'
      });
    }
    
    // Check if user has permission to reject this adjustment
    if (req.user.Role.name === 'Admin' && adjustment.spbu_id !== req.user.spbu_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this adjustment'
      });
    }
    
    // Update adjustment status to rejected
    adjustment.status = 'rejected';
    adjustment.rejected_by = req.user.id;
    adjustment = await adjustment.save();
    
    // Check if user has permission to access tanks
    const hasTankPermission = req.user.Role.name === 'Super Admin' || req.user.Role.name === 'Admin';
    
    // Prepare include options for adjustment details
    const includeOptions = [
      { model: SPBU, attributes: ['name', 'code'] },
      { model: User, as: 'operator', attributes: ['name'] },
      { model: User, as: 'adjustment_approver', attributes: ['name'] },
      { model: User, as: 'adjustment_rejector', attributes: ['name'] }
    ];
    
    // Only include tank information if user has permission
    if (hasTankPermission) {
      includeOptions.push({ model: Tank, attributes: ['name', 'fuel_type'] });
    }
    
    // Get updated adjustment with related data
    const updatedAdjustment = await Adjustment.findByPk(adjustment.id, {
      include: includeOptions
    });
    
    // Record adjustment transaction in ledger for REJECT function
    await recordAdjustmentTransactionHelper(adjustment, 'rejected', req.user.id);
    
    res.status(200).json({
      success: true,
      data: updatedAdjustment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Helper function to record adjustment transaction in ledger
const recordAdjustmentTransactionHelper = async (adjustment, status, userId) => {
  try {
    // Get tank information for ledger entry
    let fuelType = 'Unknown';
    if (adjustment.tank_id) {
      const tank = await Tank.findByPk(adjustment.tank_id);
      if (tank) {
        fuelType = tank.fuel_type;
      }
    }
    
    await recordAdjustmentTransaction({
      spbu_id: adjustment.spbu_id,
      id: adjustment.id,
      fuel_type: fuelType,
      quantity: adjustment.quantity,
      adjustment_type: adjustment.adjustment_type,
      created_by: userId,
      status: status
    });
  } catch (ledgerError) {
    console.error('Error recording adjustment transaction in ledger:', ledgerError);
    // Continue with the response even if ledger recording fails
  }
};

module.exports = {
  createAdjustment,
  getAdjustments,
  getAdjustment,
  updateAdjustment,
  approveAdjustment,
  rejectAdjustment
};