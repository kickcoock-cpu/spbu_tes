const { Sale, Tank, SPBU, sequelize, Delivery } = require('../models');
const { Op } = require('sequelize');
const { enhancedStockoutPrediction } = require('../utils/stockout-prediction');
const { enhancedDeliveryPrediction } = require('../utils/delivery-prediction');
const { enhancedDemandPrediction } = require('../utils/demand-prediction');

// @desc    Get sales prediction
// @route   GET /api/prediction/sales
// @access  Private (Super Admin: full, Admin: read-only, Operator: none)
const getSalesPrediction = async (req, res) => {
  try {
    // Get sales data for the past 30 days to make predictions
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const whereClause = req.user && req.user.Role && req.user.Role.name === 'Super Admin' 
      ? { created_at: { [Op.gte]: startDate } }
      : { spbu_id: req.user.spbu_id, created_at: { [Op.gte]: startDate } };
    
    // Get all sales data grouped by day
    const salesData = await Sale.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'sale_date'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_revenue'],
        [sequelize.fn('SUM', sequelize.col('liters')), 'total_volume'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transaction_count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    });
    
    // Calculate average daily sales
    let totalRevenue = 0;
    let totalVolume = 0;
    let totalTransactions = 0;
    
    salesData.forEach(sale => {
      totalRevenue += parseFloat(sale.dataValues.total_revenue);
      totalVolume += parseFloat(sale.dataValues.total_volume);
      totalTransactions += parseInt(sale.dataValues.transaction_count);
    });
    
    const avgDailyRevenue = salesData.length > 0 ? totalRevenue / salesData.length : 0;
    const avgDailyVolume = salesData.length > 0 ? totalVolume / salesData.length : 0;
    const avgDailyTransactions = salesData.length > 0 ? totalTransactions / salesData.length : 0;
    
    const predictionData = {
      predictionType: 'Sales Prediction',
      generatedAt: new Date(),
      predictions: [
        {
          period: 'Next 7 Days',
          expectedRevenue: Math.round(avgDailyRevenue * 7),
          expectedVolume: Math.round(avgDailyVolume * 7),
          expectedTransactions: Math.round(avgDailyTransactions * 7),
          confidence: 85
        },
        {
          period: 'Next 30 Days',
          expectedRevenue: Math.round(avgDailyRevenue * 30),
          expectedVolume: Math.round(avgDailyVolume * 30),
          expectedTransactions: Math.round(avgDailyTransactions * 30),
          confidence: 78
        }
      ]
    };
    
    // Add SPBU-specific data if not Super Admin
    if (req.user && req.user.Role && req.user.Role.name !== 'Super Admin') {
      predictionData.spbu_id = req.user.spbu_id;
    }
    
    res.status(200).json({
      success: true,
      data: predictionData
    });
  } catch (error) {
    console.error('Error in getSalesPrediction:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get delivery prediction
// @route   GET /api/prediction/deliveries
// @access  Private (Super Admin: full, Admin: read-only, Operator: none)
const getDeliveryPrediction = async (req, res) => {
  try {
    // Get current fuel stock levels
    const whereClause = req.user && req.user.Role && req.user.Role.name === 'Super Admin' 
      ? {}
      : { spbu_id: req.user.spbu_id };

    const tanks = await Tank.findAll({
      where: whereClause,
      include: [{
        model: SPBU,
        attributes: ['name', 'code']
      }]
    });

    // Get recent deliveries to analyze patterns
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90); // Last 90 days for better accuracy

    const deliveryWhereClause = req.user && req.user.Role && req.user.Role.name === 'Super Admin' 
      ? { created_at: { [Op.gte]: startDate } }
      : { spbu_id: req.user.spbu_id, created_at: { [Op.gte]: startDate } };

    const deliveryHistory = await Delivery.findAll({
      where: deliveryWhereClause,
      order: [['created_at', 'ASC']]
    });

    // Get recent sales data to calculate daily consumption
    const salesStartDate = new Date();
    salesStartDate.setDate(salesStartDate.getDate() - 60); // Last 60 days for consumption analysis

    const salesWhereClause = req.user && req.user.Role && req.user.Role.name === 'Super Admin' 
      ? { created_at: { [Op.gte]: salesStartDate } }
      : { spbu_id: req.user.spbu_id, created_at: { [Op.gte]: salesStartDate } };

    // Get detailed sales history for each fuel type
    const salesHistory = await Sale.findAll({
      where: salesWhereClause,
      order: [['created_at', 'ASC']],
      attributes: ['id', 'fuel_type', 'liters', 'transaction_date', 'created_at']
    });

    // Group sales by fuel type
    const salesByFuelType = {};
    salesHistory.forEach(sale => {
      const fuelType = sale.fuel_type;
      if (!salesByFuelType[fuelType]) {
        salesByFuelType[fuelType] = [];
      }
      salesByFuelType[fuelType].push({
        id: sale.id,
        liters: parseFloat(sale.liters),
        transaction_date: sale.transaction_date || sale.created_at,
        created_at: sale.created_at
      });
    });

    // Group deliveries by fuel type
    const deliveriesByFuelType = {};
    deliveryHistory.forEach(delivery => {
      const fuelType = delivery.fuel_type;
      if (!deliveriesByFuelType[fuelType]) {
        deliveriesByFuelType[fuelType] = [];
      }
      deliveriesByFuelType[fuelType].push({
        id: delivery.id,
        liters: parseFloat(delivery.planned_liters),
        actual_liters: delivery.actual_liters ? parseFloat(delivery.actual_liters) : null,
        created_at: delivery.created_at
      });
    });

    // Calculate predictions for each fuel type using enhanced algorithm
    const predictions = await Promise.all(tanks.map(async (tank) => {
      const fuelType = tank.fuel_type;
      const currentStock = parseFloat(tank.current_stock);
      const tankCapacity = parseFloat(tank.capacity);

      // Get sales history for this specific fuel type
      const fuelSalesHistory = salesByFuelType[fuelType] || [];
      
      // Get delivery history for this specific fuel type
      const fuelDeliveryHistory = deliveriesByFuelType[fuelType] || [];

      // Calculate consumption statistics
      let avgDailyConsumption = 0;
      let stdDevConsumption = 0;
      
      if (fuelSalesHistory.length > 0) {
        // Convert sales history to daily consumption
        const dailyConsumption = {};
        fuelSalesHistory.forEach(sale => {
          const date = new Date(sale.transaction_date).toDateString();
          if (!dailyConsumption[date]) {
            dailyConsumption[date] = 0;
          }
          dailyConsumption[date] += parseFloat(sale.liters);
        });
        
        // Create sorted array of daily consumption
        const sortedDates = Object.keys(dailyConsumption).sort((a, b) => new Date(a) - new Date(b));
        const consumptionData = sortedDates.map(date => dailyConsumption[date]);
        
        // Calculate basic statistics
        const totalConsumption = consumptionData.reduce((sum, val) => sum + val, 0);
        avgDailyConsumption = totalConsumption / consumptionData.length;
        
        // Calculate standard deviation
        const variance = consumptionData.reduce((sum, val) => sum + Math.pow(val - avgDailyConsumption, 2), 0) / consumptionData.length;
        stdDevConsumption = Math.sqrt(variance);
      }

      // Use enhanced delivery prediction algorithm
      const enhancedPrediction = enhancedDeliveryPrediction({
        fuelType,
        currentStock,
        tankCapacity,
        avgDailyConsumption,
        stdDevConsumption,
        deliveryHistory: fuelDeliveryHistory,
        supplierLeadTime: 2 // Default 2 days lead time, could be configurable
      });

      return enhancedPrediction;
    }));

    const predictionData = {
      predictionType: 'Delivery Prediction',
      generatedAt: new Date(),
      predictions
    };

    // Add SPBU-specific data if not Super Admin
    if (req.user && req.user.Role && req.user.Role.name !== 'Super Admin') {
      predictionData.spbu_id = req.user.spbu_id;
    }

    res.status(200).json({
      success: true,
      data: predictionData
    });
  } catch (error) {
    console.error('Error in getDeliveryPrediction:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get demand prediction
// @route   GET /api/prediction/demand
// @access  Private (Super Admin: full, Admin: read-only, Operator: none)
const getDemandPrediction = async (req, res) => {
  try {
    // Get sales data for the past 90 days to make better predictions
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    
    const whereClause = req.user && req.user.Role && req.user.Role.name === 'Super Admin' 
      ? { created_at: { [Op.gte]: startDate } }
      : { spbu_id: req.user.spbu_id, created_at: { [Op.gte]: startDate } };
    
    // Get all sales data grouped by date and fuel type
    const salesData = await Sale.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'sale_date'],
        'fuel_type',
        [sequelize.fn('SUM', sequelize.col('liters')), 'total_liters'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transaction_count']
      ],
      group: [
        sequelize.fn('DATE', sequelize.col('created_at')),
        'fuel_type'
      ],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    });
    
    // Convert sales data to daily format with fuel types
    const dailyData = {};
    salesData.forEach(sale => {
      const date = sale.dataValues.sale_date;
      const fuelType = sale.fuel_type;
      const liters = parseFloat(sale.dataValues.total_liters);
      const transactions = parseInt(sale.dataValues.transaction_count);
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          fuelTypes: []
        };
      }
      
      dailyData[date].fuelTypes.push({
        fuelType,
        liters,
        transactions
      });
    });
    
    // Convert to array format
    const historicalData = Object.values(dailyData);
    
    // Define fuel types to predict
    const fuelTypes = ['Pertamax', 'Pertalite', 'Solar'];
    
    // Use enhanced demand prediction algorithm
    const predictions = enhancedDemandPrediction(historicalData, fuelTypes, {
      predictionDays: 7,
      includeSeasonality: true,
      includeTrendAnalysis: true
    });
    
    const predictionData = {
      predictionType: 'Demand Prediction',
      generatedAt: new Date(),
      predictions
    };
    
    // Add SPBU-specific data if not Super Admin
    if (req.user && req.user.Role && req.user.Role.name !== 'Super Admin') {
      predictionData.spbu_id = req.user.spbu_id;
    }
    
    res.status(200).json({
      success: true,
      data: predictionData
    });
  } catch (error) {
    console.error('Error in getDemandPrediction:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get stockout prediction
// @route   GET /api/prediction/stockout
// @access  Private (Super Admin: full, Admin: read-only, Operator: none)
const getStockoutPrediction = async (req, res) => {
  try {
    // Get current fuel stock levels
    const whereClause = req.user && req.user.Role && req.user.Role.name === 'Super Admin' 
      ? {}
      : { spbu_id: req.user.spbu_id };

    const tanks = await Tank.findAll({
      where: whereClause,
      include: [{
        model: SPBU,
        attributes: ['name', 'code']
      }]
    });

    // Get recent sales data to calculate daily consumption
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 60); // Last 60 days for better accuracy

    const salesWhereClause = req.user && req.user.Role && req.user.Role.name === 'Super Admin' 
      ? { created_at: { [Op.gte]: startDate } }
      : { spbu_id: req.user.spbu_id, created_at: { [Op.gte]: startDate } };

    // Get detailed sales history for each fuel type
    const salesHistory = await Sale.findAll({
      where: salesWhereClause,
      order: [['created_at', 'ASC']],
      attributes: ['id', 'fuel_type', 'liters', 'transaction_date', 'created_at']
    });

    // Group sales by fuel type
    const salesByFuelType = {};
    salesHistory.forEach(sale => {
      const fuelType = sale.fuel_type;
      if (!salesByFuelType[fuelType]) {
        salesByFuelType[fuelType] = [];
      }
      salesByFuelType[fuelType].push({
        id: sale.id,
        liters: parseFloat(sale.liters),
        transaction_date: sale.transaction_date || sale.created_at,
        created_at: sale.created_at
      });
    });

    // Calculate predictions for each fuel type using enhanced algorithm
    const predictions = await Promise.all(tanks.map(async (tank) => {
      const fuelType = tank.fuel_type;
      const currentStock = parseFloat(tank.current_stock);
      const tankCapacity = parseFloat(tank.capacity);

      // Get sales history for this specific fuel type
      const fuelSalesHistory = salesByFuelType[fuelType] || [];

      // Use enhanced stockout prediction algorithm
      const enhancedPrediction = enhancedStockoutPrediction(
        fuelSalesHistory,
        currentStock,
        tankCapacity,
        {
          predictionHorizon: 30,
          confidenceThreshold: 0.7,
          includeSeasonality: true,
          includeTrendAnalysis: true
        }
      );

      // Calculate recommended order volume with buffer
      let recommendedOrderVolume = 5000; // Default recommendation
      
      if (enhancedPrediction.daysUntilStockout < 999 && enhancedPrediction.daysUntilStockout > 0) {
        // Calculate based on average daily consumption with 7-day buffer and 10% safety margin
        const avgDailyConsumption = fuelSalesHistory.length > 0 ? 
          fuelSalesHistory.reduce((sum, sale) => sum + sale.liters, 0) / fuelSalesHistory.length : 0;
        
        if (avgDailyConsumption > 0) {
          recommendedOrderVolume = Math.round(
            avgDailyConsumption * 
            Math.min(enhancedPrediction.daysUntilStockout, 7) * // Order for minimum of days until stockout or 7 days
            1.1 // 10% safety margin
          );
        }
      } else if (fuelSalesHistory.length > 0) {
        // Fallback calculation based on historical data
        const avgDailyConsumption = fuelSalesHistory.reduce((sum, sale) => sum + sale.liters, 0) / fuelSalesHistory.length;
        recommendedOrderVolume = Math.round(avgDailyConsumption * 7 * 1.1); // 7 days with 10% margin
      }

      return {
        fuelType,
        currentStock: Math.round(currentStock),
        tankCapacity: Math.round(tankCapacity),
        avgDailyConsumption: enhancedPrediction.predictionDetails?.statistics?.averageDailyConsumption || 0,
        daysUntilStockout: enhancedPrediction.daysUntilStockout,
        predictedStockoutDate: enhancedPrediction.predictedStockoutDate,
        confidenceLevel: enhancedPrediction.confidenceLevel,
        confidenceScore: enhancedPrediction.confidenceScore,
        consumptionTrend: enhancedPrediction.consumptionTrend,
        recommendedOrderVolume,
        predictionDetails: enhancedPrediction.predictionDetails
      };
    }));

    const predictionData = {
      predictionType: 'Stockout Prediction',
      generatedAt: new Date(),
      predictions
    };

    // Add SPBU-specific data if not Super Admin
    if (req.user && req.user.Role && req.user.Role.name !== 'Super Admin') {
      predictionData.spbu_id = req.user.spbu_id;
    }

    res.status(200).json({
      success: true,
      data: predictionData
    });
  } catch (error) {
    console.error('Error in getStockoutPrediction:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getSalesPrediction,
  getDeliveryPrediction,
  getDemandPrediction,
  getStockoutPrediction
};