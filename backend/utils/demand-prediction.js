// Enhanced demand prediction algorithms

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
 * Calculate seasonal factors for demand prediction
 * @param {Array<Object>} dailyData - Array of daily sales data
 * @param {string} fuelType - Fuel type to analyze
 * @returns {Object} - Seasonal factors by day of week
 */
const calculateSeasonalFactors = (dailyData, fuelType) => {
  // Group data by day of week
  const dayOfWeekData = {};
  dailyData.forEach(dayData => {
    const dayOfWeek = new Date(dayData.date).getDay(); // 0 = Sunday, 1 = Monday, etc.
    if (!dayOfWeekData[dayOfWeek]) {
      dayOfWeekData[dayOfWeek] = [];
    }
    const fuelData = dayData.fuelTypes.find(f => f.fuelType === fuelType);
    if (fuelData) {
      dayOfWeekData[dayOfWeek].push(fuelData.liters);
    }
  });
  
  // Calculate average for each day of week
  const dayAverages = {};
  Object.keys(dayOfWeekData).forEach(day => {
    const sum = dayOfWeekData[day].reduce((acc, val) => acc + val, 0);
    dayAverages[day] = sum / dayOfWeekData[day].length;
  });
  
  // Calculate overall average
  const allValues = Object.values(dayOfWeekData).flat();
  const overallAverage = allValues.reduce((acc, val) => acc + val, 0) / allValues.length;
  
  // Calculate seasonal factors
  const seasonalFactors = {};
  Object.keys(dayAverages).forEach(day => {
    seasonalFactors[day] = overallAverage > 0 ? dayAverages[day] / overallAverage : 1;
  });
  
  return seasonalFactors;
};

/**
 * Enhanced demand prediction for a specific fuel type
 * @param {Array<Object>} historicalData - Historical daily sales data
 * @param {string} fuelType - Fuel type to predict
 * @param {Object} options - Additional options
 * @returns {Object} - Enhanced demand prediction
 */
const enhancedFuelDemandPrediction = (historicalData, fuelType, options = {}) => {
  const {
    predictionDays = 7,
    includeSeasonality = true,
    includeTrendAnalysis = true
  } = options;
  
  if (!historicalData || historicalData.length === 0) {
    return {
      predictedVolume: 0,
      confidence: 0.1,
      trend: 'stable',
      seasonalFactor: 1,
      lastYearVolume: 0,
      variance: 0
    };
  }
  
  // Extract fuel-specific data
  const fuelData = historicalData
    .map(dayData => {
      const fuelEntry = dayData.fuelTypes.find(f => f.fuelType === fuelType);
      return fuelEntry ? { date: dayData.date, liters: fuelEntry.liters } : null;
    })
    .filter(Boolean);
  
  if (fuelData.length === 0) {
    return {
      predictedVolume: 0,
      confidence: 0.1,
      trend: 'stable',
      seasonalFactor: 1,
      lastYearVolume: 0,
      variance: 0
    };
  }
  
  // Calculate basic statistics
  const volumes = fuelData.map(d => d.liters);
  const totalVolume = volumes.reduce((sum, val) => sum + val, 0);
  const avgVolume = totalVolume / volumes.length;
  const variance = volumes.reduce((sum, val) => sum + Math.pow(val - avgVolume, 2), 0) / volumes.length;
  const stdDev = Math.sqrt(variance);
  
  // Method 1: Simple average
  let predictedVolume = avgVolume;
  
  // Method 2: Moving average (7-day window)
  const movingAvg7 = calculateMovingAverage(volumes, 7);
  const avgMovingAvg7 = movingAvg7.length > 0 ? movingAvg7[movingAvg7.length - 1] : avgVolume;
  
  // Method 3: Exponential moving average
  const ema = calculateEMA(volumes, 0.3); // Alpha = 0.3
  const avgEMA = ema.length > 0 ? ema[ema.length - 1] : avgVolume;
  
  // Method 4: Trend analysis
  let trend = 'stable';
  if (includeTrendAnalysis && volumes.length >= 14) {
    // Create data points for regression (last 14 days)
    const recentData = volumes.slice(-14);
    const dataPoints = recentData.map((value, index) => ({ x: index, y: value }));
    const { slope, intercept } = linearRegression(dataPoints);
    
    // Determine trend
    if (slope > 0.5) {
      trend = 'increasing';
    } else if (slope < -0.5) {
      trend = 'decreasing';
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
        predictedVolume = avgProjected;
      }
    }
  }
  
  // Method 5: Seasonality analysis
  let seasonalFactor = 1;
  if (includeSeasonality && volumes.length >= 14) {
    const seasonalFactors = calculateSeasonalFactors(historicalData, fuelType);
    const today = new Date().getDay();
    seasonalFactor = seasonalFactors[today] || 1;
    predictedVolume *= seasonalFactor;
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
    predictedVolume * weights.simple +
    avgMovingAvg7 * weights.ma7 +
    avgEMA * weights.ema +
    predictedVolume * weights.trend +
    predictedVolume * weights.seasonal;
  
  const finalPrediction = Math.round(weightedPrediction);
  
  // Calculate confidence score
  let confidenceScore = 0.5; // Base confidence
  
  // Increase confidence based on data quality
  if (volumes.length >= 30) confidenceScore += 0.2; // Good amount of data
  if (stdDev / avgVolume < 0.5) confidenceScore += 0.15; // Low variability
  if (trend !== 'stable') confidenceScore += 0.1; // Trend detected
  if (finalPrediction > 0) confidenceScore += 0.05; // Valid prediction
  
  // Cap confidence score
  confidenceScore = Math.min(confidenceScore, 1.0);
  
  // Get last year's data if available
  let lastYearVolume = 0;
  const lastYearDate = new Date();
  lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
  
  const lastYearData = fuelData.find(d => {
    const dataDate = new Date(d.date);
    return dataDate.toDateString() === lastYearDate.toDateString();
  });
  
  if (lastYearData) {
    lastYearVolume = lastYearData.liters;
  }
  
  return {
    predictedVolume: finalPrediction,
    confidence: confidenceScore,
    trend,
    seasonalFactor,
    lastYearVolume,
    variance: Math.round(variance)
  };
};

/**
 * Enhanced demand prediction for all fuel types
 * @param {Array<Object>} historicalData - Historical daily sales data
 * @param {Array<string>} fuelTypes - List of fuel types to predict
 * @param {Object} options - Additional options
 * @returns {Array<Object>} - Enhanced demand predictions for each day
 */
const enhancedDemandPrediction = (historicalData, fuelTypes, options = {}) => {
  const {
    predictionDays = 7
  } = options;
  
  // Get unique days from historical data
  const uniqueDays = [...new Set(historicalData.map(d => new Date(d.date).toDateString()))]
    .map(dateStr => new Date(dateStr))
    .sort((a, b) => a - b);
  
  // Create predictions for the next predictionDays
  const predictions = [];
  const today = new Date();
  
  // Map day numbers to day names
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  for (let i = 0; i < predictionDays; i++) {
    const predictionDate = new Date(today);
    predictionDate.setDate(today.getDate() + i);
    
    const dayName = dayNames[predictionDate.getDay()];
    
    // Create prediction for each fuel type
    const fuelPredictions = {};
    fuelTypes.forEach(fuelType => {
      fuelPredictions[fuelType.toLowerCase()] = enhancedFuelDemandPrediction(
        historicalData, 
        fuelType, 
        { ...options, predictionDate }
      );
    });
    
    predictions.push({
      date: predictionDate.toISOString(),
      day: dayName,
      ...fuelPredictions
    });
  }
  
  return predictions;
};

module.exports = {
  enhancedDemandPrediction,
  enhancedFuelDemandPrediction,
  calculateMovingAverage,
  calculateEMA,
  detectSeasonality,
  linearRegression,
  calculateConfidenceInterval,
  calculateSeasonalFactors
};