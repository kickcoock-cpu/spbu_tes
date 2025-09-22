const { Sale, Deposit, Delivery, User, SPBU } = require('../models');
const { Op, fn, col } = require('sequelize');

// @desc    Get suspicious transactions
// @route   GET /api/audit/suspicious
// @access  Private (Super Admin: full, Admin: read-only, Operator: none)
const getSuspiciousTransactions = async (req, res) => {
  try {
    // Get date range (default to last 30 days)
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    // Define suspicious patterns
    const suspiciousPatterns = {
      // Unusually large transactions
      largeTransactionThreshold: 10000000, // 10 million Rupiah
      // Unusually small transactions (potential test transactions)
      smallTransactionThreshold: 1000, // 1 thousand Rupiah
      // Multiple transactions in short time period
      rapidTransactionThreshold: 5, // 5 transactions in 10 minutes
      // Transactions outside normal business hours
      businessStartHour: 6, // 6 AM
      businessEndHour: 22 // 10 PM
    };
    
    let suspiciousSales = [];
    let suspiciousDeposits = [];
    let suspiciousDeliveries = [];
    
    // Build where clauses based on user role
    let salesWhereClause, depositsWhereClause, deliveriesWhereClause;
    
    if (req.user && req.user.Role && req.user.Role.name === 'Super Admin') {
      salesWhereClause = {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      };
      
      depositsWhereClause = {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      };
      
      deliveriesWhereClause = {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      };
    } else {
      // Admin sees only their SPBU data
      salesWhereClause = {
        spbu_id: req.user.spbu_id,
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      };
      
      depositsWhereClause = {
        spbu_id: req.user.spbu_id,
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      };
      
      deliveriesWhereClause = {
        spbu_id: req.user.spbu_id,
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      };
    }
    
    // Fetch sales data with user and SPBU info
    const sales = await Sale.findAll({
      where: salesWhereClause,
      include: [
        {
          model: User,
          as: 'operator',
          attributes: ['name', 'email']
        },
        {
          model: SPBU,
          attributes: ['name', 'code']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Fetch deposits data with user and SPBU info
    const deposits = await Deposit.findAll({
      where: depositsWhereClause,
      include: [
        {
          model: User,
          as: 'operator',
          attributes: ['name', 'email']
        },
        {
          model: SPBU,
          attributes: ['name', 'code']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Fetch deliveries data with SPBU info
    const deliveries = await Delivery.findAll({
      where: deliveriesWhereClause,
      include: [
        {
          model: SPBU,
          attributes: ['name', 'code']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Identify suspicious sales
    for (let i = 0; i < sales.length; i++) {
      const sale = sales[i];
      const flags = [];
      
      // Check for large transaction
      if (parseFloat(sale.amount) > suspiciousPatterns.largeTransactionThreshold) {
        flags.push('Large transaction');
      }
      
      // Check for small transaction
      if (parseFloat(sale.amount) < suspiciousPatterns.smallTransactionThreshold) {
        flags.push('Small transaction (potential test)');
      }
      
      // Check for transactions outside business hours
      const saleHour = new Date(sale.created_at).getHours();
      if (saleHour < suspiciousPatterns.businessStartHour || saleHour > suspiciousPatterns.businessEndHour) {
        flags.push('Outside business hours');
      }
      
      // Check for rapid transactions (multiple sales by same operator in short time)
      let rapidTransactionCount = 0;
      const timeWindow = 10 * 60 * 1000; // 10 minutes in milliseconds
      
      for (let j = Math.max(0, i - 10); j < Math.min(sales.length, i + 10); j++) {
        if (j !== i) {
          const otherSale = sales[j];
          if (otherSale.operator_id === sale.operator_id) {
            const timeDiff = Math.abs(new Date(sale.created_at) - new Date(otherSale.created_at));
            if (timeDiff <= timeWindow) {
              rapidTransactionCount++;
            }
          }
        }
      }
      
      if (rapidTransactionCount >= suspiciousPatterns.rapidTransactionThreshold) {
        flags.push('Rapid transactions');
      }
      
      // Add to suspicious list if any flags
      if (flags.length > 0) {
        suspiciousSales.push({
          id: sale.id,
          type: 'Sale',
          amount: parseFloat(sale.amount),
          liters: parseFloat(sale.liters),
          fuelType: sale.fuel_type,
          operator: sale.operator ? sale.operator.name : 'Unknown',
          spbu: sale.SPBU ? `${sale.SPBU.name} (${sale.SPBU.code})` : 'Unknown',
          timestamp: sale.created_at,
          flags: flags
        });
      }
    }
    
    // Identify suspicious deposits
    for (let i = 0; i < deposits.length; i++) {
      const deposit = deposits[i];
      const flags = [];
      
      // Check for large transaction
      if (parseFloat(deposit.amount) > suspiciousPatterns.largeTransactionThreshold) {
        flags.push('Large transaction');
      }
      
      // Check for small transaction
      if (parseFloat(deposit.amount) < suspiciousPatterns.smallTransactionThreshold) {
        flags.push('Small transaction (potential test)');
      }
      
      // Check for transactions outside business hours
      const depositHour = new Date(deposit.created_at).getHours();
      if (depositHour < suspiciousPatterns.businessStartHour || depositHour > suspiciousPatterns.businessEndHour) {
        flags.push('Outside business hours');
      }
      
      // Add to suspicious list if any flags
      if (flags.length > 0) {
        suspiciousDeposits.push({
          id: deposit.id,
          type: 'Deposit',
          amount: parseFloat(deposit.amount),
          paymentMethod: deposit.payment_method,
          operator: deposit.operator ? deposit.operator.name : 'Unknown',
          spbu: deposit.SPBU ? `${deposit.SPBU.name} (${deposit.SPBU.code})` : 'Unknown',
          timestamp: deposit.created_at,
          flags: flags
        });
      }
    }
    
    // Identify suspicious deliveries
    for (let i = 0; i < deliveries.length; i++) {
      const delivery = deliveries[i];
      const flags = [];
      
      // Check for large delivery
      const liters = parseFloat(delivery.planned_liters || delivery.actual_liters || 0);
      if (liters > 50000) { // 50,000 liters
        flags.push('Large delivery');
      }
      
      // Check for small delivery
      if (liters > 0 && liters < 1000) { // Less than 1,000 liters
        flags.push('Small delivery (potential test)');
      }
      
      // Add to suspicious list if any flags
      if (flags.length > 0) {
        suspiciousDeliveries.push({
          id: delivery.id,
          type: 'Delivery',
          liters: liters,
          fuelType: delivery.fuel_type,
          supplier: delivery.supplier,
          spbu: delivery.SPBU ? `${delivery.SPBU.name} (${delivery.SPBU.code})` : 'Unknown',
          timestamp: delivery.created_at,
          flags: flags
        });
      }
    }
    
    // Combine all suspicious transactions
    const allSuspiciousTransactions = [
      ...suspiciousSales,
      ...suspiciousDeposits,
      ...suspiciousDeliveries
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.status(200).json({
      success: true,
      data: {
        transactions: allSuspiciousTransactions,
        summary: {
          totalSuspicious: allSuspiciousTransactions.length,
          suspiciousSales: suspiciousSales.length,
          suspiciousDeposits: suspiciousDeposits.length,
          suspiciousDeliveries: suspiciousDeliveries.length
        }
      }
    });
  } catch (error) {
    console.error('Error in getSuspiciousTransactions:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getSuspiciousTransactions
};