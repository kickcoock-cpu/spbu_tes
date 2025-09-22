// Enhanced deliveries prediction algorithms

/**
 * Calculate delivery confidence based on multiple factors
 * @param {Object} params - Parameters for confidence calculation
 * @returns {number} - Confidence score (0-100)
 */
const calculateDeliveryConfidence = (params) => {
  const {
    historicalAccuracy,
    volumeConsistency,
    seasonalStability,
    supplierReliability
  } = params;

  // Weighted calculation of confidence
  const confidence = (
    (historicalAccuracy || 0) * 0.3 +
    (volumeConsistency || 0) * 0.25 +
    (seasonalStability || 0) * 0.2 +
    (supplierReliability || 0) * 0.25
  );

  return Math.min(100, Math.max(0, Math.round(confidence)));
};

/**
 * Calculate optimal delivery timing based on stock and consumption
 * @param {Object} params - Parameters for timing calculation
 * @returns {Object} - Delivery timing information
 */
const calculateDeliveryTiming = (params) => {
  const {
    currentStock,
    avgDailyConsumption,
    safetyStock,
    supplierLeadTime,
    tankCapacity
  } = params;

  // Calculate days until critical stockout
  const daysUntilStockout = avgDailyConsumption > 0 
    ? Math.floor((currentStock - safetyStock) / avgDailyConsumption) 
    : 999;

  // Recommend delivery when stock reaches 1.5x safety stock level
  const recommendedDeliveryThreshold = safetyStock * 1.5;
  const daysUntilThreshold = avgDailyConsumption > 0 
    ? Math.floor((currentStock - recommendedDeliveryThreshold) / avgDailyConsumption) 
    : 999;

  // Calculate delivery date (considering supplier lead time)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + Math.max(1, daysUntilThreshold));

  // Calculate when to place order (delivery date minus supplier lead time)
  const orderDate = new Date(deliveryDate);
  orderDate.setDate(orderDate.getDate() - (supplierLeadTime || 2));

  // Delivery window (±1 day from recommended date)
  const deliveryWindow = {
    earliest: new Date(deliveryDate),
    latest: new Date(deliveryDate)
  };
  deliveryWindow.earliest.setDate(deliveryWindow.earliest.getDate() - 1);
  deliveryWindow.latest.setDate(deliveryWindow.latest.getDate() + 1);

  return {
    daysUntilStockout,
    daysUntilThreshold,
    recommendedDeliveryDate: deliveryDate,
    recommendedOrderDate: orderDate,
    deliveryWindow,
    urgency: getUrgencyLevel(daysUntilStockout)
  };
};

/**
 * Determine urgency level based on days until stockout
 * @param {number} daysUntilStockout - Days until stockout
 * @returns {string} - Urgency level
 */
const getUrgencyLevel = (daysUntilStockout) => {
  if (daysUntilStockout <= 1) return 'critical';
  if (daysUntilStockout <= 3) return 'high';
  if (daysUntilStockout <= 7) return 'medium';
  return 'low';
};

/**
 * Calculate safety stock level based on consumption patterns
 * @param {number} avgDailyConsumption - Average daily consumption
 * @param {number} stdDevConsumption - Standard deviation of consumption
 * @returns {number} - Safety stock level
 */
const calculateSafetyStock = (avgDailyConsumption, stdDevConsumption) => {
  // Safety stock = 2 days average consumption + 1.65 * std dev (95% service level)
  return Math.round(avgDailyConsumption * 2 + stdDevConsumption * 1.65);
};

/**
 * Analyze historical delivery patterns
 * @param {Array} deliveryHistory - Historical delivery data
 * @returns {Object} - Analysis results
 */
const analyzeDeliveryHistory = (deliveryHistory) => {
  if (!deliveryHistory || deliveryHistory.length === 0) {
    return {
      historicalAccuracy: 50, // Default mid-level confidence
      volumeConsistency: 50,
      avgDeliveryVolume: 0,
      stdDevDeliveryVolume: 0,
      avgFrequencyDays: 7, // Default weekly delivery
      lastDeliveryDate: null
    };
  }

  // Calculate average and standard deviation of delivery volumes
  const volumes = deliveryHistory.map(d => parseFloat(d.liters));
  const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
  const stdDevVolume = Math.sqrt(
    volumes.reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) / volumes.length
  );

  // Calculate delivery frequency
  const dates = deliveryHistory
    .map(d => new Date(d.created_at))
    .sort((a, b) => a - b);
  
  let totalDays = 0;
  for (let i = 1; i < dates.length; i++) {
    totalDays += (dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24);
  }
  const avgFrequencyDays = dates.length > 1 ? totalDays / (dates.length - 1) : 7;

  // Calculate historical accuracy (if actual data available)
  let accuracySum = 0;
  let accuracyCount = 0;
  deliveryHistory.forEach(d => {
    if (d.actual_liters && d.planned_liters) {
      const accuracy = 100 - (Math.abs(d.actual_liters - d.planned_liters) / d.planned_liters * 100);
      accuracySum += Math.max(0, Math.min(100, accuracy));
      accuracyCount++;
    }
  });
  const historicalAccuracy = accuracyCount > 0 
    ? Math.round(accuracySum / accuracyCount) 
    : 75; // Default high confidence if no data

  return {
    historicalAccuracy,
    volumeConsistency: Math.max(0, Math.min(100, 100 - (stdDevVolume / avgVolume * 50))),
    avgDeliveryVolume: Math.round(avgVolume),
    stdDevDeliveryVolume: Math.round(stdDevVolume),
    avgFrequencyDays: Math.round(avgFrequencyDays),
    lastDeliveryDate: dates[dates.length - 1]
  };
};

/**
 * Enhanced deliveries prediction for a specific fuel type
 * @param {Object} params - Prediction parameters
 * @returns {Object} - Enhanced delivery prediction
 */
const enhancedDeliveryPrediction = (params) => {
  const {
    fuelType,
    currentStock,
    tankCapacity,
    avgDailyConsumption,
    stdDevConsumption,
    deliveryHistory,
    supplierLeadTime = 2
  } = params;

  // Calculate safety stock
  const safetyStock = calculateSafetyStock(avgDailyConsumption, stdDevConsumption);

  // Analyze delivery history
  const historyAnalysis = analyzeDeliveryHistory(deliveryHistory);

  // Calculate delivery timing
  const timing = calculateDeliveryTiming({
    currentStock,
    avgDailyConsumption,
    safetyStock,
    supplierLeadTime,
    tankCapacity
  });

  // Calculate recommended volume (fill to 95% of tank capacity)
  const targetStockLevel = tankCapacity * 0.95;
  const recommendedVolume = Math.max(0, Math.round(targetStockLevel - currentStock + 
    (avgDailyConsumption * supplierLeadTime))); // Add consumption during lead time

  // Calculate confidence
  const confidence = calculateDeliveryConfidence({
    historicalAccuracy: historyAnalysis.historicalAccuracy,
    volumeConsistency: historyAnalysis.volumeConsistency,
    seasonalStability: 80, // Default value, could be enhanced with seasonal data
    supplierReliability: 90 // Default value, could be enhanced with supplier data
  });

  return {
    fuelType,
    recommendedVolume,
    deliveryDate: timing.recommendedDeliveryDate,
    recommendedOrderDate: timing.recommendedOrderDate,
    deliveryWindow: timing.deliveryWindow,
    confidence,
    urgency: timing.urgency,
    currentStock: Math.round(currentStock),
    tankCapacity: Math.round(tankCapacity),
    avgDailyConsumption: Math.round(avgDailyConsumption),
    safetyStock: Math.round(safetyStock),
    daysUntilStockout: timing.daysUntilStockout,
    lastDeliveryDate: historyAnalysis.lastDeliveryDate,
    lastDeliveryVolume: historyAnalysis.avgDeliveryVolume,
    supplierLeadTime
  };
};

module.exports = {
  enhancedDeliveryPrediction,
  calculateDeliveryConfidence,
  calculateDeliveryTiming,
  getUrgencyLevel,
  calculateSafetyStock,
  analyzeDeliveryHistory
};