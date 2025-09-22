const { Sale, SPBU, User, Tank, sequelize } = require('../models');
const { Op } = require('sequelize');
const { broadcastDashboardUpdate } = require('../index');
const { updatePredictionsOnSale } = require('../services/realtime-stockout-service');
const { v4: uuidv4 } = require('uuid');
const { recordSaleTransaction } = require('../utils/ledgerUtils');

// @desc    Get sales by operator
// @route   GET /api/sales/by-operator/:operatorId
// @access  Private (Super Admin: full access, Admin: read-only)
const getSalesByOperator = async (req, res) => {
  try {
    const { operatorId } = req.params;
    
    // Validate operator ID
    if (!operatorId) {
      return res.status(400).json({
        success: false,
        message: 'Operator ID is required'
      });
    }
    
    let sales;
    
    const includeOptions = [
      { model: SPBU, attributes: ['name', 'code'] },
      { model: User, as: 'operator', attributes: ['name', 'email'] }
    ];
    
    if (req.user.Role.name === 'Super Admin') {
      // Super Admin sees sales for specific operator
      sales = await Sale.findAll({ 
        where: { operator_id: operatorId },
        include: includeOptions 
      });
    } else if (req.user.Role.name === 'Admin') {
      // Admin sees sales for specific operator from their SPBU
      sales = await Sale.findAll({ 
        where: { 
          operator_id: operatorId,
          spbu_id: req.user.spbu_id 
        },
        include: includeOptions 
      });
    } else {
      // For other roles, deny access
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    
    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    console.error('Error in getSalesByOperator:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create sale transaction
// @route   POST /api/sales
// @access  Private (Operator: full access)
const createSale = async (req, res) => {
  try {
    const { fuel_type, liters, amount } = req.body;
    
    // Validate required fields
    if (!fuel_type || !liters || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Get operator's SPBU
    const spbuId = req.user.spbu_id;
    
    if (!spbuId) {
      return res.status(400).json({
        success: false,
        message: 'Operator must be assigned to an SPBU'
      });
    }
    
    // Find a tank with matching fuel type and sufficient stock
    const tank = await Tank.findOne({
      where: {
        spbu_id: spbuId,
        fuel_type: fuel_type,
        current_stock: {
          [Op.gte]: liters
        }
      }
    });
    
    if (!tank) {
      return res.status(400).json({
        success: false,
        message: `No tank found with sufficient ${fuel_type} stock`
      });
    }
    
    // Generate transaction ID (ID-xxxxxx format) with uniqueness check
    const generateTransactionId = async () => {
      let transactionId;
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 10) {
        // Generate a more unique ID using timestamp and random components
        const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp
        const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
        const spbuCode = spbuId.toString().padStart(2, '0'); // SPBU ID as 2-digit code
        transactionId = `ID-${spbuCode}${timestamp}${random}`;
        
        // Check if this ID already exists
        const existingSale = await Sale.findOne({
          where: { transaction_id: transactionId }
        });
        
        if (!existingSale) {
          isUnique = true;
        }
        
        attempts++;
      }
      
      if (!isUnique) {
        // Fallback to UUID if we can't generate a unique ID
        const uuid = require('uuid');
        transactionId = `ID-${uuid.v4().substring(0, 10)}`;
      }
      
      return transactionId;
    };
    
    // Use a transaction to ensure data consistency
    const transaction = await sequelize.transaction();
    
    try {
      // Create sale with transaction ID
      const sale = await Sale.create({
        transaction_id: await generateTransactionId(),
        spbu_id: spbuId,
        operator_id: req.user.id,
        fuel_type,
        liters,
        amount
      }, { transaction });
      
      // Reduce stock in the matching tank
      const newStock = parseFloat(tank.current_stock) - parseFloat(liters);
      await tank.update({
        current_stock: newStock
      }, { transaction });
      
      // Commit the transaction
      await transaction.commit();
      
      // Get sale with related data
      const saleWithDetails = await Sale.findByPk(sale.id, {
        include: [
          { model: SPBU, attributes: ['name', 'code'] },
          { model: User, as: 'operator', attributes: ['name', 'email'] }
        ]
      });
      
      // Broadcast dashboard update for real-time updates
      await broadcastDashboardUpdate();
      
      // Trigger real-time stockout prediction update
      await updatePredictionsOnSale(saleWithDetails);
      
      // Record sale transaction in ledger
      try {
        await recordSaleTransaction({
          spbu_id: sale.spbu_id,
          id: sale.id,
          fuel_type: sale.fuel_type,
          liters: sale.liters,
          amount: sale.amount,
          operator_id: sale.operator_id
        });
      } catch (ledgerError) {
        console.error('Error recording sale transaction in ledger:', ledgerError);
        // Continue with the response even if ledger recording fails
      }
      
      res.status(201).json({
        success: true,
        data: saleWithDetails
      });
    } catch (error) {
      // Rollback the transaction in case of error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private (Super Admin: read-only, Admin: read-only, Operator: full access)
const getSales = async (req, res) => {
  try {
    let sales;
    
    const includeOptions = [
      { model: SPBU, attributes: ['name', 'code'] },
      { model: User, as: 'operator', attributes: ['name', 'email'] }
    ];
    
    if (req.user.Role.name === 'Super Admin') {
      // Super Admin sees all sales
      sales = await Sale.findAll({ include: includeOptions });
    } else if (req.user.Role.name === 'Admin') {
      // Admin sees only sales from their SPBU
      sales = await Sale.findAll({ 
        where: { spbu_id: req.user.spbu_id },
        include: includeOptions
      });
    } else if (req.user.Role.name === 'Operator') {
      // Operator sees only sales from their SPBU
      sales = await Sale.findAll({ 
        where: { spbu_id: req.user.spbu_id },
        include: includeOptions
      });
    } else {
      // For other roles, deny access
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    
    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    console.error('Error in getSales:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private (Super Admin: read-only, Admin: read-only, Operator: full access)
const getSale = async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: [
        { model: SPBU, attributes: ['name', 'code'] },
        { model: User, as: 'operator', attributes: ['name', 'email'] }
      ]
    });
    
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }
    
    // Check if user has permission to view this sale
    if ((req.user.Role.name === 'Admin' || req.user.Role.name === 'Operator') && sale.spbu_id !== req.user.spbu_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this sale'
      });
    }
    
    res.status(200).json({
      success: true,
      data: sale
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
  createSale,
  getSales,
  getSale,
  getSalesByOperator // Tambahkan ini
};