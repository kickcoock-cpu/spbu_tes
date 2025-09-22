// Enhanced stockout prediction algorithms

/**
 * Calculate moving average for time series data
 * @param {Array<number>} data - Array of data points
 * @param {number} windowSize - Size of the moving window
 * @returns {Array<number>} - Moving averages
 */
const calculateMovingAverage = (data, windowSize) => {
  if (data.length < windowSize) return [];
  
  const result = [];
  for (let i = windowSize - 1; i < data.length; i++) {
    const window = data.slice(i - windowSize + 1, i + 1);
    const sum = window.reduce((acc, val) => acc + val, 0);
    result.push(sum / windowSize);
  }
  return result;
};

/**
 * Calculate exponential moving average
 * @param {Array<number>} data - Array of data points
 * @param {number} alpha - Smoothing factor (0 < alpha < 1)
 * @returns {Array<number>} - Exponential moving averages
 */
const calculateEMA = (data, alpha) => {
  if (data.length === 0) return [];
  
  const ema = [data[0]]; // First EMA is the first data point
  for (let i = 1; i < data.length; i++) {
    ema.push(alpha * data[i] + (1 - alpha) * ema[i - 1]);
  }
  return ema;
};

/**
 * Detect seasonality in time series data using autocorrelation
 * @param {Array<number>} data - Array of data points
 * @returns {number} - Seasonality period (0 if none detected)
 */
const detectSeasonality = (data) => {
  if (data.length < 14) return 0; // Need at least 2 weeks of data
  
  // Calculate autocorrelation for lags 1-7 (weekly pattern)
  let maxCorrelation = 0;
  let seasonalityPeriod = 0;
  
  for (let lag = 1; lag <= 7; lag++) {
    let correlation = 0;
    let count = 0;
    
    for (let i = lag; i < data.length; i++) {
      correlation += data[i] * data[i - lag];
      count++;
    }
    
    if (count > 0) {
      correlation /= count;
      if (correlation > maxCorrelation && correlation > 0.3) { // Threshold for significance
        maxCorrelation = correlation;
        seasonalityPeriod = lag;
      }
    }
  }
  
  return seasonalityPeriod;
};

/**
 * Improved linear regression for trend analysis
 * @param {Array<Object>} dataPoints - Array of {x, y} points
 * @returns {Object} - Slope and intercept of the regression line
 */
const linearRegression = (dataPoints) => {
  const n = dataPoints.length;
  if (n < 2) return { slope: 0, intercept: 0 };
  
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  
  for (let i = 0; i < n; i++) {
    const x = dataPoints[i].x;
    const y = dataPoints[i].y;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
};

/**
 * Calculate confidence interval for predictions
 * @param {Array<number>} residuals - Residuals from the model
 * @param {number} confidenceLevel - Confidence level (e.g., 0.95 for 95%)
 * @returns {number} - Margin of error
 */
const calculateConfidenceInterval = (residuals, confidenceLevel = 0.95) => {
  if (residuals.length === 0) return 0;
  
  // Calculate standard deviation of residuals
  const mean = residuals.reduce((sum, val) => sum + val, 0) / residuals.length;
  const variance = residuals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / residuals.length;
  const stdDev = Math.sqrt(variance);
  
  // Simplified confidence interval calculation
  // In practice, you would use t-distribution for small samples
  const zScore = 1.96; // For 95% confidence level
  return zScore * stdDev / Math.sqrt(residuals.length);
};

/**
 * Enhanced stockout prediction using multiple methods
 * @param {Array<Object>} salesHistory - Historical sales data
 * @param {number} currentStock - Current stock level
 * @param {number} tankCapacity - Tank capacity
 * @param {Object} options - Additional options
 * @returns {Object} - Enhanced prediction results
 */
const enhancedStockoutPrediction = (salesHistory, currentStock, tankCapacity, options = {}) => {
  const {
    predictionHorizon = 30, // Days to predict
    confidenceThreshold = 0.7,
    includeSeasonality = true,
    includeTrendAnalysis = true
  } = options;
  
  if (!salesHistory || salesHistory.length === 0) {
    return {
      daysUntilStockout: 999,
      predictedStockoutDate: null,
      confidenceLevel: 'low',
      confidenceScore: 0.1,
      consumptionTrend: 'stable',
      methodUsed: 'fallback',
      predictionDetails: {
        reason: 'No historical data available',
        statistics: {
          averageDailyConsumption: 0,
          standardDeviation: 0,
          dataPoints: 0
        }
      }
    };
  }
  
  // Convert sales history to daily consumption
  const dailyConsumption = {};
  salesHistory.forEach(sale => {
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
  const avgDailyConsumption = totalConsumption / consumptionData.length;
  const stdDev = Math.sqrt(
    consumptionData.reduce((sum, val) => sum + Math.pow(val - avgDailyConsumption, 2), 0) / consumptionData.length
  );
  
  // Method 1: Simple average
  let daysUntilStockoutSimple = avgDailyConsumption > 0 ? 
    Math.floor(currentStock / avgDailyConsumption) : 999;
  
  // Method 2: Moving average (7-day window)
  const movingAvg7 = calculateMovingAverage(consumptionData, 7);
  const avgMovingAvg7 = movingAvg7.length > 0 ? 
    movingAvg7[movingAvg7.length - 1] : avgDailyConsumption;
  let daysUntilStockoutMA7 = avgMovingAvg7 > 0 ? 
    Math.floor(currentStock / avgMovingAvg7) : 999;
  
  // Method 3: Exponential moving average
  const ema = calculateEMA(consumptionData, 0.3); // Alpha = 0.3
  const avgEMA = ema.length > 0 ? ema[ema.length - 1] : avgDailyConsumption;
  let daysUntilStockoutEMA = avgEMA > 0 ? 
    Math.floor(currentStock / avgEMA) : 999;
  
  // Method 4: Trend analysis
  let consumptionTrend = 'stable';
  let daysUntilStockoutTrend = daysUntilStockoutSimple;
  
  if (includeTrendAnalysis && consumptionData.length >= 14) {
    // Create data points for regression (last 14 days)
    const recentData = consumptionData.slice(-14);
    const dataPoints = recentData.map((value, index) => ({ x: index, y: value }));
    const { slope, intercept } = linearRegression(dataPoints);
    
    // Determine trend
    if (slope > 0.5) {
      consumptionTrend = 'increasing';
    } else if (slope < -0.5) {
      consumptionTrend = 'decreasing';
    }
    
    // Adjust prediction based on trend
    if (slope !== 0) {
      // Project consumption for next 7 days based on trend
      const projectedConsumption = [];
      for (let i = 0; i < 7; i++) {
        projectedConsumption.push(Math.max(0, intercept + slope * (recentData.length + i)));
      }
      
      const avgProjected = projectedConsumption.reduce((sum, val) => sum + val, 0) / projectedConsumption.length;
      if (avgProjected > 0) {
        daysUntilStockoutTrend = Math.floor(currentStock / avgProjected);
      }
    }
  }
  
  // Method 5: Seasonality analysis
  let daysUntilStockoutSeasonal = daysUntilStockoutSimple;
  
  if (includeSeasonality && consumptionData.length >= 14) {
    const seasonalityPeriod = detectSeasonality(consumptionData);
    if (seasonalityPeriod > 0) {
      // Apply seasonal adjustment
      const seasonalFactor = 1.0; // Simplified - in practice would calculate actual seasonal factors
      daysUntilStockoutSeasonal = Math.floor(daysUntilStockoutSimple * seasonalFactor);
    }
  }
  
  // Weighted combination of methods
  const weights = {
    simple: 0.3,
    ma7: 0.25,
    ema: 0.25,
    trend: 0.15,
    seasonal: 0.05
  };
  
  const weightedPrediction = 
    daysUntilStockoutSimple * weights.simple +
    daysUntilStockoutMA7 * weights.ma7 +
    daysUntilStockoutEMA * weights.ema +
    daysUntilStockoutTrend * weights.trend +
    daysUntilStockoutSeasonal * weights.seasonal;
  
  const finalDaysUntilStockout = Math.round(weightedPrediction);
  
  // Calculate confidence score
  let confidenceScore = 0.5; // Base confidence
  
  // Increase confidence based on data quality
  if (consumptionData.length >= 30) confidenceScore += 0.2; // Good amount of data
  if (stdDev / avgDailyConsumption < 0.5) confidenceScore += 0.15; // Low variability
  if (consumptionTrend !== 'stable') confidenceScore += 0.1; // Trend detected
  if (finalDaysUntilStockout < 999 && finalDaysUntilStockout > 0) confidenceScore += 0.05; // Valid prediction
  
  // Cap confidence score
  confidenceScore = Math.min(confidenceScore, 1.0);
  
  // Determine confidence level
  let confidenceLevel = 'low';
  if (confidenceScore >= 0.8) {
    confidenceLevel = 'high';
  } else if (confidenceScore >= 0.6) {
    confidenceLevel = 'medium';
  }
  
  // Calculate predicted stockout date
  const predictedStockoutDate = new Date();
  predictedStockoutDate.setDate(predictedStockoutDate.getDate() + finalDaysUntilStockout);
  
  return {
    daysUntilStockout: finalDaysUntilStockout,
    predictedStockoutDate: finalDaysUntilStockout < 999 ? predictedStockoutDate.toISOString() : null,
    confidenceLevel,
    confidenceScore,
    consumptionTrend,
    methodUsed: 'enhanced',
    predictionDetails: {
      methods: {
        simple: daysUntilStockoutSimple,
        movingAverage7: daysUntilStockoutMA7,
        exponentialMovingAverage: daysUntilStockoutEMA,
        trendBased: daysUntilStockoutTrend,
        seasonalAdjusted: daysUntilStockoutSeasonal
      },
      statistics: {
        averageDailyConsumption: avgDailyConsumption,
        standardDeviation: stdDev,
        dataPoints: consumptionData.length
      }
    }
  };
};

module.exports = {
  enhancedStockoutPrediction,
  calculateMovingAverage,
  calculateEMA,
  detectSeasonality,
  linearRegression,
  calculateConfidenceInterval
};