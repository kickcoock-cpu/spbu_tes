const { Price, SPBU, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Create price
// @route   POST /api/prices
// @access  Private (Super Admin: full, Admin: full, Operator: none)
const createPrice = async (req, res) => {
  try {
    const { fuelType, price } = req.body;
    
    // Validate required fields
    if (!fuelType || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fuel type and price'
      });
    }
    
    // Get user's SPBU
    const spbuId = req.user.Role.name === 'Super Admin' ? req.body.spbu_id : req.user.spbu_id;
    
    // Super Admin can create global prices (no SPBU), others need SPBU
    if (req.user.Role.name !== 'Super Admin' && !spbuId) {
      return res.status(400).json({
        success: false,
        message: 'User must be assigned to an SPBU'
      });
    }
    
    // Create price
    const priceRecord = await Price.create({
      spbu_id: req.user.Role.name === 'Super Admin' ? spbuId : req.user.spbu_id,
      fuel_type: fuelType,
      price,
      updated_by: req.user.id
    });
    
    // Get price with related data
    const priceWithDetails = await Price.findByPk(priceRecord.id, {
      include: [
        { model: SPBU, attributes: ['name', 'code'] },
        { model: User, as: 'updated_by_user', attributes: ['name'] }
      ]
    });
    
    res.status(201).json({
      success: true,
      data: priceWithDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all prices
// @route   GET /api/prices
// @access  Private (All roles)
const getPrices = async (req, res) => {
  try {
    let prices;
    
    const includeOptions = [
      { model: SPBU, attributes: ['name', 'code'] },
      { model: User, as: 'updated_by_user', attributes: ['name'] }
    ];
    
    if (req.user.Role.name === 'Super Admin') {
      // Super Admin sees all prices (global and SPBU-specific)
      prices = await Price.findAll({ include: includeOptions });
    } else if (req.user.Role.name === 'Admin') {
      // Admin sees global prices and prices for their SPBU
      prices = await Price.findAll({
        where: {
          [Op.or]: [
            { spbu_id: null }, // Global prices
            { spbu_id: req.user.spbu_id } // SPBU-specific prices
          ]
        },
        include: includeOptions
      });
    } else if (req.user.Role.name === 'Operator') {
      // Operator sees only current prices (read-only)
      prices = await Price.findAll({
        where: {
          [Op.or]: [
            { spbu_id: null }, // Global prices
            { spbu_id: req.user.spbu_id } // SPBU-specific prices
          ]
        },
        include: includeOptions
      });
    }
    
    res.status(200).json({
      success: true,
      count: prices.length,
      data: prices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single price
// @route   GET /api/prices/:id
// @access  Private (All roles)
const getPrice = async (req, res) => {
  try {
    const price = await Price.findByPk(req.params.id, {
      include: [
        { model: SPBU, attributes: ['name', 'code'] },
        { model: User, as: 'updated_by_user', attributes: ['name'] }
      ]
    });
    
    if (!price) {
      return res.status(404).json({
        success: false,
        message: 'Price not found'
      });
    }
    
    // Check if user has permission to view this price
    if (req.user.Role.name === 'Admin' && 
        price.spbu_id && 
        price.spbu_id !== req.user.spbu_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this price'
      });
    }
    
    res.status(200).json({
      success: true,
      data: price
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update price
// @route   PUT /api/prices/:id
// @access  Private (Super Admin: full, Admin: full, Operator: none)
const updatePrice = async (req, res) => {
  try {
    const { price } = req.body;
    
    let priceRecord = await Price.findByPk(req.params.id);
    
    if (!priceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Price not found'
      });
    }
    
    // Check if user has permission to update this price
    if (req.user.Role.name === 'Admin' && 
        priceRecord.spbu_id && 
        priceRecord.spbu_id !== req.user.spbu_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this price'
      });
    }
    
    // Update price
    priceRecord.price = price || priceRecord.price;
    priceRecord.updated_by = req.user.id;
    priceRecord = await priceRecord.save();
    
    // Get updated price with related data
    const updatedPrice = await Price.findByPk(priceRecord.id, {
      include: [
        { model: SPBU, attributes: ['name', 'code'] },
        { model: User, as: 'updated_by_user', attributes: ['name'] }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: updatedPrice
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
  createPrice,
  getPrices,
  getPrice,
  updatePrice
};