// Real-time stockout prediction service
const { Tank, Sale, SPBU } = require('../models');
const { enhancedStockoutPrediction } = require('../utils/stockout-prediction');
const { Op } = require('sequelize');
const https = require('https');

// Store for real-time stockout predictions
const stockoutPredictionsCache = new Map();
const predictionUpdateListeners = new Set();

// Vercel API endpoint for updating real-time data
const VERCEL_REALTIME_API = process.env.VERCEL_REALTIME_API || 'https://your-realtime-api.vercel.app/api/realtime/update';

/**
 * Send data to Vercel real-time API
 * @param {string} type - Type of data update
 * @param {Object} data - Data to send
 */
const sendToVercelRealtimeAPI = async (type, data) => {
  if (process.env.VERCEL !== '1') {
    // Only send to Vercel API in Vercel environment
    return;
  }

  try {
    const postData = JSON.stringify({ type, data });
    
    const options = {
      hostname: new URL(VERCEL_REALTIME_API).hostname,
      port: 443,
      path: new URL(VERCEL_REALTIME_API).pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      res.on('data', () => {}); // Consume response data
    });

    req.on('error', (error) => {
      console.error('Error sending data to Vercel real-time API:', error);
    });

    req.write(postData);
    req.end();
  } catch (error) {
    console.error('Error preparing data for Vercel real-time API:', error);
  }
};

/**\n * Subscribe to stockout prediction updates\n * @param {Function} callback - Function to call when updates occur\n * @returns {Function} - Unsubscribe function\n */
const subscribeToStockoutUpdates = (callback) => {
  predictionUpdateListeners.add(callback);
  
  // Return unsubscribe function
  return () => {
    predictionUpdateListeners.delete(callback);
  };
};

/**\n * Notify all subscribers of stockout prediction updates\n * @param {Object} data - Updated stockout prediction data\n */
const notifyStockoutUpdates = (data) => {
  // Send data to Vercel real-time API
  sendToVercelRealtimeAPI('stockout-predictions', data);
  
  // Notify local subscribers (for development/local environments)
  predictionUpdateListeners.forEach(callback => {
    try {
      callback(data);
    } catch (error) {
      console.error('Error in stockout update callback:', error);
    }
  });
};

/**
 * Calculate real-time stockout predictions for all tanks
 * @param {Object} options - Options for calculation
 * @returns {Promise<Array>} - Array of stockout predictions
 */
const calculateRealTimeStockoutPredictions = async (options = {}) => {
  try {
    const { 
      spbuId = null, 
      fuelType = null, 
      daysOfHistory = 60,
      includeDetailedAnalysis = true 
    } = options;
    
    // Get tanks with optional SPBU filter
    const tankWhereClause = spbuId ? { spbu_id: spbuId } : {};
    const fuelTypeWhereClause = fuelType ? { fuel_type: fuelType } : {};
    
    const tanks = await Tank.findAll({
      where: { ...tankWhereClause, ...fuelTypeWhereClause },
      include: [{
        model: SPBU,
        attributes: ['name', 'code']
      }]
    });
    
    if (tanks.length === 0) {
      return [];
    }
    
    // Get recent sales data
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysOfHistory);
    
    const salesWhereClause = spbuId ? 
      { spbu_id: spbuId, created_at: { [Op.gte]: startDate } } :
      { created_at: { [Op.gte]: startDate } };
      
    const fuelTypeSalesWhereClause = fuelType ? 
      { fuel_type: fuelType } : {};
    
    // Get detailed sales history
    const salesHistory = await Sale.findAll({
      where: { ...salesWhereClause, ...fuelTypeSalesWhereClause },
      order: [['created_at', 'ASC']],
      attributes: ['id', 'spbu_id', 'fuel_type', 'liters', 'transaction_date', 'created_at']
    });
    
    // Group sales by fuel type and SPBU
    const salesByFuelType = {};
    salesHistory.forEach(sale => {
      const key = `${sale.spbu_id}-${sale.fuel_type}`;
      if (!salesByFuelType[key]) {
        salesByFuelType[key] = [];
      }
      salesByFuelType[key].push({
        id: sale.id,
        spbu_id: sale.spbu_id,
        liters: parseFloat(sale.liters),
        transaction_date: sale.transaction_date || sale.created_at,
        created_at: sale.created_at
      });
    });
    
    // Calculate predictions for each tank
    const predictions = await Promise.all(tanks.map(async (tank) => {
      const fuelType = tank.fuel_type;
      const spbuId = tank.spbu_id;
      const currentStock = parseFloat(tank.current_stock);
      const tankCapacity = parseFloat(tank.capacity);
      
      // Get sales history for this specific fuel type and SPBU
      const fuelSalesHistory = salesByFuelType[`${spbuId}-${fuelType}`] || [];
      
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
      
      // Calculate recommended order volume
      let recommendedOrderVolume = 5000; // Default recommendation
      
      if (enhancedPrediction.daysUntilStockout < 999 && enhancedPrediction.daysUntilStockout > 0) {
        const avgDailyConsumption = fuelSalesHistory.length > 0 ? 
          fuelSalesHistory.reduce((sum, sale) => sum + sale.liters, 0) / fuelSalesHistory.length : 0;
        
        if (avgDailyConsumption > 0) {
          recommendedOrderVolume = Math.round(
            avgDailyConsumption * 
            Math.min(enhancedPrediction.daysUntilStockout, 7) * 
            1.1
          );
        }
      } else if (fuelSalesHistory.length > 0) {
        const avgDailyConsumption = fuelSalesHistory.reduce((sum, sale) => sum + sale.liters, 0) / fuelSalesHistory.length;
        recommendedOrderVolume = Math.round(avgDailyConsumption * 7 * 1.1);
      }
      
      // Determine criticality level
      let criticalityLevel = 'normal';
      if (enhancedPrediction.daysUntilStockout <= 5) {
        criticalityLevel = 'critical';
      } else if (enhancedPrediction.daysUntilStockout <= 10) {
        criticalityLevel = 'warning';
      }
      
      return {
        tankId: tank.id,
        spbuId: tank.spbu_id,
        spbu: tank.SPBU ? {
          name: tank.SPBU.name,
          code: tank.SPBU.code
        } : null,
        fuelType,
        currentStock: Math.round(currentStock),
        tankCapacity: Math.round(tankCapacity),
        fillPercentage: tankCapacity > 0 ? (currentStock / tankCapacity) * 100 : 0,
        daysUntilStockout: enhancedPrediction.daysUntilStockout,
        predictedStockoutDate: enhancedPrediction.predictedStockoutDate,
        confidenceLevel: enhancedPrediction.confidenceLevel,
        confidenceScore: enhancedPrediction.confidenceScore,
        consumptionTrend: enhancedPrediction.consumptionTrend,
        criticalityLevel,
        recommendedOrderVolume,
        lastUpdated: new Date().toISOString(),
        predictionDetails: includeDetailedAnalysis ? enhancedPrediction.predictionDetails : undefined
      };
    }));
    
    return predictions;
  } catch (error) {
    console.error('Error calculating real-time stockout predictions:', error);
    throw error;
  }
};

/**
 * Get cached stockout predictions or calculate new ones
 * @param {Object} options - Options for retrieval
 * @returns {Promise<Array>} - Array of stockout predictions
 */
const getStockoutPredictions = async (options = {}) => {
  const cacheKey = `${options.spbuId || 'all'}-${options.fuelType || 'all'}-${options.daysOfHistory || 60}`;
  
  // Check if we have cached predictions that are still valid (5 minutes)
  const cached = stockoutPredictionsCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < 5 * 60 * 1000) {
    return cached.data;
  }
  
  // Calculate new predictions
  const predictions = await calculateRealTimeStockoutPredictions(options);
  
  // Cache the results
  stockoutPredictionsCache.set(cacheKey, {
    data: predictions,
    timestamp: Date.now()
  });
  
  return predictions;
};

/**
 * Clear stockout predictions cache
 * @param {string} cacheKey - Specific cache key to clear, or 'all' to clear everything
 */
const clearStockoutPredictionsCache = (cacheKey = 'all') => {
  if (cacheKey === 'all') {
    stockoutPredictionsCache.clear();
  } else {
    stockoutPredictionsCache.delete(cacheKey);
  }
};

/**
 * Update stockout predictions when a sale is made
 * @param {Object} sale - The newly created sale
 */
const updatePredictionsOnSale = async (sale) => {
  try {
    // Clear relevant cache entries
    clearStockoutPredictionsCache('all');
    
    // Recalculate predictions for this SPBU and fuel type
    const updatedPredictions = await calculateRealTimeStockoutPredictions({
      spbuId: sale.spbu_id,
      fuelType: sale.fuel_type
    });
    
    // Notify subscribers of the update
    notifyStockoutUpdates({
      type: 'SALE_COMPLETED',
      spbuId: sale.spbu_id,
      fuelType: sale.fuel_type,
      predictions: updatedPredictions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating predictions on sale:', error);
  }
};

/**
 * Update stockout predictions when stock levels change
 * @param {Object} tank - The updated tank
 */
const updatePredictionsOnStockChange = async (tank) => {
  try {
    // Clear relevant cache entries
    clearStockoutPredictionsCache('all');
    
    // Recalculate predictions for this SPBU and fuel type
    const updatedPredictions = await calculateRealTimeStockoutPredictions({
      spbuId: tank.spbu_id,
      fuelType: tank.FuelType.name
    });
    
    // Notify subscribers of the update
    notifyStockoutUpdates({
      type: 'STOCK_CHANGED',
      spbuId: tank.spbu_id,
      fuelType: tank.FuelType.name,
      predictions: updatedPredictions,
      timestamp: new Date().toISOString()
    });
    
    // Also send dashboard update to Vercel real-time API
    sendToVercelRealtimeAPI('dashboard', {
      totalLiters: 0, // This would be calculated in a real implementation
      totalSalesCount: 0,
      stockPredictions: updatedPredictions,
      tankStocks: [],
      recentSales: [],
      recentDeliveries: [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating predictions on stock change:', error);
  }
};

module.exports = {
  calculateRealTimeStockoutPredictions,
  getStockoutPredictions,
  subscribeToStockoutUpdates,
  updatePredictionsOnSale,
  updatePredictionsOnStockChange,
  clearStockoutPredictionsCache,
  sendToVercelRealtimeAPI
};