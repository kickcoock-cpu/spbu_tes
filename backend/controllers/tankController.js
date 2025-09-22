const { Tank, SPBU } = require('../models');
const { getCurrentPriceForFuelType } = require('../helpers/priceHelper');

// @desc    Create tank
// @route   POST /api/tanks
// @access  Private (Super Admin only)
const createTank = async (req, res) => {
  try {
    console.log('Create tank request received');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    // Only Super Admin can create tanks
    if (req.user.Role.name !== 'Super Admin') {
      console.log('User is not Super Admin');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Super Admin can create tanks.'
      });
    }
    
    const { spbu_id, name, fuel_type, capacity } = req.body;
    console.log('Extracted data:', { spbu_id, name, fuel_type, capacity });

    // Validate required fields
    if (!spbu_id || !name || !fuel_type || !capacity) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: spbu_id, name, fuel_type, capacity'
      });
    }

    // Check if SPBU exists
    console.log('Checking if SPBU exists:', spbu_id);
    const spbu = await SPBU.findByPk(spbu_id);
    console.log('SPBU found:', spbu);
    
    if (!spbu) {
      console.log('SPBU not found');
      return res.status(400).json({
        success: false,
        message: 'SPBU not found'
      });
    }

    // Create tank
    console.log('Creating tank');
    const tank = await Tank.create({
      spbu_id,
      name,
      fuel_type,
      capacity
    });
    console.log('Tank created:', tank);

    res.status(201).json({
      success: true,
      data: tank
    });
  } catch (error) {
    console.error('Error in createTank:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all tanks
// @route   GET /api/tanks
// @access  Private (Super Admin: full access, Admin: read-only, Operator: read-only)
const getTanks = async (req, res) => {
  try {
    let tanks = [];
    
    if (req.user.Role.name === 'Super Admin') {
      // Super Admin sees all tanks
      tanks = await Tank.findAll({
        include: [
          { model: SPBU, attributes: ['name', 'code'] }
        ]
      });
    } else if (req.user.Role.name === 'Admin') {
      // Admin only sees tanks from their SPBU
      // Check if user has spbu_id assigned
      if (!req.user.spbu_id) {
        return res.status(400).json({
          success: false,
          message: 'Admin user not assigned to any SPBU'
        });
      }
      
      tanks = await Tank.findAll({
        where: {
          spbu_id: req.user.spbu_id
        },
        include: [
          { model: SPBU, attributes: ['name', 'code'] }
        ]
      });
    } else if (req.user.Role.name === 'Operator') {
      // Operator only sees tanks from their SPBU
      // Check if user has spbu_id assigned
      if (!req.user.spbu_id) {
        return res.status(400).json({
          success: false,
          message: 'Operator user not assigned to any SPBU'
        });
      }
      
      tanks = await Tank.findAll({
        where: {
          spbu_id: req.user.spbu_id
        },
        include: [
          { model: SPBU, attributes: ['name', 'code'] }
        ]
      });
    } else {
      // For other roles, return permission error
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    
    // Add current price information to each tank
    const tanksWithPrices = await Promise.all(tanks.map(async (tank) => {
      const currentPrice = await getCurrentPriceForFuelType(tank.fuel_type, tank.spbu_id);
      return {
        ...tank.toJSON(),
        current_price: currentPrice
      };
    }));
    
    return res.status(200).json({
      success: true,
      count: tanksWithPrices.length,
      data: tanksWithPrices
    });
  } catch (error) {
    console.error('Error in getTanks:', error);
    // Always return JSON response
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get single tank
// @route   GET /api/tanks/:id
// @access  Private (Super Admin: full access, Admin: read-only, Operator: read-only)
const getTank = async (req, res) => {
  try {
    console.log('Get tank request received, ID:', req.params.id);
    console.log('User:', req.user);
    
    const tank = await Tank.findByPk(req.params.id, {
      include: [
        { model: SPBU, attributes: ['name', 'code'] }
      ]
    });
    
    console.log('Tank found:', tank);

    if (!tank) {
      console.log('Tank not found');
      return res.status(404).json({
        success: false,
        message: 'Tank not found'
      });
    }
    
    // Check permissions for Admin and Operator roles
    if (req.user.Role.name === 'Admin' || req.user.Role.name === 'Operator') {
      // Check if user has spbu_id assigned
      if (!req.user.spbu_id) {
        console.log(`${req.user.Role.name} user has no SPBU assigned`);
        return res.status(400).json({
          success: false,
          message: `${req.user.Role.name} user not assigned to any SPBU`
        });
      }
      
      if (tank.spbu_id !== req.user.spbu_id) {
        console.log(`${req.user.Role.name} not authorized to view this tank`);
        return res.status(403).json({
          success: false,
          message: `Access denied. You can only view tanks from your SPBU.`
        });
      }
    }

    // Add current price information to the tank
    const currentPrice = await getCurrentPriceForFuelType(tank.fuel_type, tank.spbu_id);
    const tankWithPrice = {
      ...tank.toJSON(),
      current_price: currentPrice
    };

    return res.status(200).json({
      success: true,
      data: tankWithPrice
    });
  } catch (error) {
    console.error('Error in getTank:', error);
    // Always return JSON response
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Update tank
// @route   PUT /api/tanks/:id
// @access  Private (Super Admin only)
const updateTank = async (req, res) => {
  try {
    console.log('Update tank request received');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    // Only Super Admin can update tanks
    if (req.user.Role.name !== 'Super Admin') {
      console.log('User is not Super Admin');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Super Admin can update tanks.'
      });
    }
    
    const tank = await Tank.findByPk(req.params.id);
    console.log('Tank found:', tank);

    if (!tank) {
      console.log('Tank not found');
      return res.status(404).json({
        success: false,
        message: 'Tank not found'
      });
    }

    // Update tank with validation
    const { spbu_id, name, fuel_type, capacity, current_stock } = req.body;
    
    // Prepare update data with only allowed fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (fuel_type !== undefined) updateData.fuel_type = fuel_type;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (current_stock !== undefined) updateData.current_stock = current_stock;
    if (spbu_id !== undefined) {
      console.log('Checking if SPBU exists:', spbu_id);
      // If spbu_id is provided, check if SPBU exists
      const spbu = await SPBU.findByPk(spbu_id);
      if (!spbu) {
        console.log('SPBU not found');
        return res.status(400).json({
          success: false,
          message: 'SPBU not found'
        });
      }
      updateData.spbu_id = spbu_id;
    }
    
    console.log('Update data:', updateData);

    await tank.update(updateData);
    console.log('Tank updated:', tank);

    res.status(200).json({
      success: true,
      data: tank
    });
  } catch (error) {
    console.error('Error in updateTank:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete tank
// @route   DELETE /api/tanks/:id
// @access  Private (Super Admin only)
const deleteTank = async (req, res) => {
  try {
    console.log('Delete tank request received');
    console.log('Request params:', req.params);
    console.log('User:', req.user);
    
    // Only Super Admin can delete tanks
    if (req.user.Role.name !== 'Super Admin') {
      console.log('User is not Super Admin');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Super Admin can delete tanks.'
      });
    }
    
    const tank = await Tank.findByPk(req.params.id);
    console.log('Tank found:', tank);

    if (!tank) {
      console.log('Tank not found');
      return res.status(404).json({
        success: false,
        message: 'Tank not found'
      });
    }

    await tank.destroy();
    console.log('Tank deleted');

    res.status(200).json({
      success: true,
      message: 'Tank removed'
    });
  } catch (error) {
    console.error('Error in deleteTank:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  createTank,
  getTanks,
  getTank,
  updateTank,
  deleteTank
};