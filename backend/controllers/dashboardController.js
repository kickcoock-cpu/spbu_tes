const { Sale, Delivery, Deposit, Attendance, SPBU, User, Adjustment, Tank, sequelize } = require('../models');
const { Op, fn, col, where } = require('sequelize');
const { enhancedStockoutPrediction } = require('../utils/stockout-prediction');

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Public (but restricted by RBAC middleware)
const getDashboard = async (req, res) => {
  try {
    const userRole = req.user.Role.name;
    const userId = req.user.id;
    const spbuId = req.user.spbu_id;
    
    console.log('=== DASHBOARD DEBUG INFO ===');
    console.log('User Role:', userRole);
    console.log('User ID:', userId);
    console.log('SPBU ID:', spbuId);
    console.log('=== END DASHBOARD DEBUG INFO ===');
    
    let dashboardData = {};
    
    // Initialize dashboard data structure
    dashboardData = {
      totalLiters: 0,
      totalSalesCount: 0,
      stockPredictions: [],
      tankStocks: [],
      recentSales: [],
      recentDeliveries: [],
      adjustmentMetrics: {
        totalAdjustments: 0,
        totalGain: 0,
        totalLoss: 0,
        netValue: 0
      }
    };
    
    if (userRole === 'Super Admin') {
      console.log('=== SUPER ADMIN DASHBOARD ===');
      // Super Admin sees all data
      // Total sales for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const salesToday = await Sale.findAll({
        where: {
          created_at: {
            [Op.gte]: today
          }
        },
        attributes: [
          [fn('SUM', col('liters')), 'totalLiters'],
          [fn('COUNT', col('id')), 'totalSalesCount']
        ]
      });
      
      dashboardData.totalLiters = parseFloat(salesToday[0]?.dataValues.totalLiters) || 0;
      dashboardData.totalSalesCount = parseInt(salesToday[0]?.dataValues.totalSalesCount) || 0;
      
      // Get all tanks with stock information
      const tanks = await Tank.findAll({
        include: [{
          model: SPBU,
          attributes: ['name', 'code']
        }]
      });
      
      console.log('Total tanks for Super Admin:', tanks.length);
      
      dashboardData.tankStocks = tanks.map(tank => {
        const percentage = (parseFloat(tank.current_stock) / parseFloat(tank.capacity)) * 100;
        return {
          id: tank.id,
          name: tank.name,
          fuelType: tank.fuel_type,
          capacity: parseFloat(tank.capacity),
          currentStock: parseFloat(tank.current_stock),
          percentage: percentage
        };
      });
      
      // Get stock predictions (based on actual sales data) using enhanced algorithm
      dashboardData.stockPredictions = await Promise.all(tanks.map(async (tank) => {
        // Get detailed sales history for this fuel type for the past 60 days
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        
        // Get sales data for this fuel type for the past 60 days
        const salesHistory = await Sale.findAll({
          where: {
            fuel_type: tank.fuel_type,
            created_at: {
              [Op.gte]: sixtyDaysAgo
            }
          },
          order: [['created_at', 'ASC']],
          attributes: ['id', 'fuel_type', 'liters', 'transaction_date', 'created_at']
        });
        
        // Use enhanced stockout prediction algorithm
        const enhancedPrediction = enhancedStockoutPrediction(
          salesHistory.map(sale => ({
            id: sale.id,
            liters: parseFloat(sale.liters),
            transaction_date: sale.transaction_date || sale.created_at,
            created_at: sale.created_at
          })),
          parseFloat(tank.current_stock),
          parseFloat(tank.capacity),
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
          // Calculate based on average daily consumption with 7-day buffer and 10% safety margin
          const avgDailyConsumption = salesHistory.length > 0 ? 
            salesHistory.reduce((sum, sale) => sum + parseFloat(sale.liters), 0) / salesHistory.length : 0;
          
          if (avgDailyConsumption > 0) {
            recommendedOrderVolume = Math.round(
              avgDailyConsumption * 
              Math.min(enhancedPrediction.daysUntilStockout, 7) * // Order for minimum of days until stockout or 7 days
              1.1 // 10% safety margin
            );
          }
        } else if (salesHistory.length > 0) {
          // Fallback calculation based on historical data
          const avgDailyConsumption = salesHistory.reduce((sum, sale) => sum + parseFloat(sale.liters), 0) / salesHistory.length;
          recommendedOrderVolume = Math.round(avgDailyConsumption * 7 * 1.1); // 7 days with 10% margin
        }
        
        // Calculate predicted stockout date
        const predictedStockoutDate = enhancedPrediction.predictedStockoutDate ? 
          new Date(enhancedPrediction.predictedStockoutDate) : new Date();
        if (!enhancedPrediction.predictedStockoutDate) {
          predictedStockoutDate.setFullYear(predictedStockoutDate.getFullYear() + 1); // Far future date
        }
        
        const currentStock = parseFloat(tank.current_stock);
        const tankCapacity = parseFloat(tank.capacity);
        const fillPercentage = tankCapacity > 0 ? (currentStock / tankCapacity) * 100 : 0;
        
        return {
          fuelType: tank.fuel_type,
          currentStock: Math.round(currentStock),
          tankCapacity: Math.round(tankCapacity),
          fillPercentage: fillPercentage,
          avgDailyConsumption: enhancedPrediction.predictionDetails?.statistics?.averageDailyConsumption || 0,
          consumptionTrend: enhancedPrediction.consumptionTrend,
          confidenceLevel: enhancedPrediction.confidenceLevel,
          confidenceScore: enhancedPrediction.confidenceScore,
          predictedStockoutDate: predictedStockoutDate.toISOString(),
          daysUntilStockout: enhancedPrediction.daysUntilStockout,
          recommendedOrderVolume: recommendedOrderVolume
        };
      }));
      console.log('[Super Admin] Final stock predictions:', dashboardData.stockPredictions);
      
      // Get recent sales (last 10)
      dashboardData.recentSales = await Sale.findAll({
        include: [
          {
            model: User,
            as: 'operator',
            attributes: ['name']
          },
          {
            model: SPBU,
            as: 'SPBU',
            attributes: ['name', 'code']
          },
          {
            model: FuelType,
            attributes: ['name']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 10
      }).then(sales => sales.map(sale => ({
        id: sale.id,
        transactionId: sale.transaction_id,
        operatorName: sale.operator ? sale.operator.name : 'Unknown',
        totalAmount: parseFloat(sale.amount),
        litersSold: parseFloat(sale.liters),
        fuel_type: sale.FuelType ? sale.FuelType.name : 'Unknown',
        spbu: sale.SPBU ? {
          name: sale.SPBU.name,
          code: sale.SPBU.code
        } : null,
        createdAt: sale.created_at
      })));
      
      console.log('[Super Admin] Recent sales count:', dashboardData.recentSales.length);
      
      // Get recent deliveries (last 10)
      dashboardData.recentDeliveries = await Delivery.findAll({
        order: [['created_at', 'DESC']],
        limit: 10
      }).then(deliveries => deliveries.map(delivery => ({
        id: delivery.id,
        supplier: delivery.supplier,
        fuelType: delivery.fuel_type,
        liters: parseFloat(delivery.actual_liters || 0),
        status: delivery.status,
        createdAt: delivery.created_at
      })));
      
      console.log('[Super Admin] Recent deliveries count:', dashboardData.recentDeliveries.length);
      
      // Get adjustment metrics for Super Admin
      const adjustments = await Adjustment.findAll();
      const totalAdjustments = adjustments.length;
      const totalGain = adjustments
        .filter(item => item.adjustment_type === 'gain' && item.quantity)
        .reduce((sum, item) => sum + parseFloat(item.quantity), 0);
      const totalLoss = adjustments
        .filter(item => item.adjustment_type === 'loss' && item.quantity)
        .reduce((sum, item) => sum + parseFloat(item.quantity), 0);
      const netValue = totalGain - totalLoss;
      
      dashboardData.adjustmentMetrics = {
        totalAdjustments,
        totalGain,
        totalLoss,
        netValue
      };
      
      console.log('=== END SUPER ADMIN DASHBOARD ===');
      
    } else if (userRole === 'Admin' || userRole === 'Operator') {
      console.log('=== ADMIN/OPERATOR DASHBOARD ===');
      console.log('SPBU ID for filtering:', spbuId);
      // Admin and Operator see SPBU-specific data
      if (!spbuId) {
        return res.status(400).json({
          success: false,
          message: 'User must be assigned to an SPBU'
        });
      }
      
      // Total sales for today for this SPBU
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const salesToday = await Sale.findAll({
        where: {
          spbu_id: spbuId,
          created_at: {
            [Op.gte]: today
          }
        },
        attributes: [
          [fn('SUM', col('liters')), 'totalLiters'],
          [fn('COUNT', col('id')), 'totalSalesCount']
        ]
      });
      
      dashboardData.totalLiters = parseFloat(salesToday[0]?.dataValues.totalLiters) || 0;
      dashboardData.totalSalesCount = parseInt(salesToday[0]?.dataValues.totalSalesCount) || 0;
      
      // Get tanks for this SPBU
      console.log('Fetching tanks for SPBU ID:', spbuId);
      const tanks = await Tank.findAll({
        where: {
          spbu_id: spbuId
        },
        include: [{
          model: SPBU,
          attributes: ['name', 'code']
        }]
      });
      
      console.log('Found tanks for SPBU ID', spbuId, ':', tanks.map(t => ({
        id: t.id,
        name: t.name,
        spbu_id: t.spbu_id,
        fuel_type: t.fuel_type
      })));
      
      console.log('Total tanks for Admin/Operator (SPBU ID:', spbuId, '):', tanks.length);
      
      dashboardData.tankStocks = tanks.map(tank => {
        const percentage = (parseFloat(tank.current_stock) / parseFloat(tank.capacity)) * 100;
        return {
          id: tank.id,
          name: tank.name,
          fuelType: tank.fuel_type,
          capacity: parseFloat(tank.capacity),
          currentStock: parseFloat(tank.current_stock),
          percentage: percentage
        };
      });
      
      // Get stock predictions for this SPBU (based on actual sales data)
      dashboardData.stockPredictions = await Promise.all(tanks.map(async (tank) => {
        // Calculate average daily consumption based on sales data from the past 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Get sales data for this fuel type in this SPBU for the past 30 days
        const salesData = await Sale.findAll({
          where: {
            spbu_id: spbuId,
            fuel_type: tank.fuel_type,
            created_at: {
              [Op.gte]: thirtyDaysAgo
            }
          },
          attributes: [
            [fn('SUM', col('liters')), 'totalLiters'],
            [fn('COUNT', col('id')), 'totalTransactions']
          ]
        });
        
        // Calculate average daily consumption
        const totalLiters = parseFloat(salesData[0]?.dataValues.totalLiters) || 0;
        const totalTransactions = parseInt(salesData[0]?.dataValues.totalTransactions) || 0;
        const avgDailyConsumption = totalLiters > 0 ? totalLiters / 30 : 0;
        const avgTransactionsPerDay = totalTransactions > 0 ? totalTransactions / 30 : 0;
        
        console.log(`[Admin/Operator] Tank ${tank.id} - Fuel Type: ${tank.fuel_type}, SPBU ID: ${spbuId}, Total Liters: ${totalLiters}, Avg Daily Consumption: ${avgDailyConsumption}`);
        console.log(`[Admin/Operator] Tank ${tank.id} - Will use fallback logic: ${avgDailyConsumption <= 0}`);
        
        // Calculate days until stockout
        const currentStock = parseFloat(tank.current_stock);
        const tankCapacity = parseFloat(tank.capacity);
        console.log(`[Admin/Operator] Tank ${tank.id} - Current Stock: ${currentStock}, Capacity: ${tankCapacity}`);
        
        // Enhanced stock prediction data
        let daysUntilStockout;
        let consumptionTrend = 'stable'; // 'increasing', 'decreasing', 'stable'
        let confidenceLevel = 'high'; // 'high', 'medium', 'low'
        
        // Check if currentStock or tankCapacity are valid numbers
        if (isNaN(currentStock) || isNaN(tankCapacity) || tankCapacity <= 0) {
          console.log(`[Admin/Operator] Tank ${tank.id} - Invalid stock data: currentStock=${currentStock}, tankCapacity=${tankCapacity}`);
          daysUntilStockout = 999; // Default to normal
        } else if (avgDailyConsumption > 0) {
          daysUntilStockout = Math.floor(currentStock / avgDailyConsumption);
          console.log(`[Admin/Operator] Tank ${tank.id} - Calculated from consumption: ${currentStock} / ${avgDailyConsumption} = ${daysUntilStockout} days`);
          
          // Calculate trend by comparing last 15 days vs previous 15 days
          const fifteenDaysAgo = new Date();
          fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
          
          // Recent sales: last 15 days (15 days ago to today)
          const recentSalesData = await Sale.findAll({
            where: {
              spbu_id: spbuId,
              fuel_type: tank.fuel_type,
              created_at: {
                [Op.gte]: fifteenDaysAgo,
                [Op.lte]: new Date()
              }
            },
            attributes: [[fn('SUM', col('liters')), 'totalLiters']]
          });
          
          // Previous sales: 30 days ago to 15 days ago
          const previousSalesData = await Sale.findAll({
            where: {
              spbu_id: spbuId,
              fuel_type: tank.fuel_type,
              created_at: {
                [Op.gte]: thirtyDaysAgo,
                [Op.lt]: fifteenDaysAgo
              }
            },
            attributes: [[fn('SUM', col('liters')), 'totalLiters']]
          });
          
          const recentLiters = parseFloat(recentSalesData[0]?.dataValues.totalLiters) || 0;
          const previousLiters = parseFloat(previousSalesData[0]?.dataValues.totalLiters) || 0;
          
          const recentAvg = recentLiters > 0 ? recentLiters / 15 : 0;
          const previousAvg = previousLiters > 0 ? previousLiters / 15 : 0;
          
          // Determine trend
          if (recentAvg > 0 && previousAvg > 0) {
            const trendPercentage = ((recentAvg - previousAvg) / previousAvg) * 100;
            if (trendPercentage > 10) {
              consumptionTrend = 'increasing';
              confidenceLevel = 'medium';
            } else if (trendPercentage < -10) {
              consumptionTrend = 'decreasing';
              confidenceLevel = 'medium';
            }
          }
          
          // If the calculated days is unrealistically high, fall back to percentage-based estimation
          if (daysUntilStockout > 1000) {
            console.log(`[Admin/Operator] Tank ${tank.id} - Days too high, falling back to percentage-based estimation`);
            const fillPercentage = (currentStock / tankCapacity) * 100;
            console.log(`[Admin/Operator] Tank ${tank.id} - Fill Percentage: ${fillPercentage}`);
            
            if (fillPercentage < 20) {
              daysUntilStockout = 5; // Critical
              console.log(`[Admin/Operator] Tank ${tank.id} - Critical level (fallback): ${daysUntilStockout} days`);
              confidenceLevel = 'low';
            } else if (fillPercentage < 50) {
              daysUntilStockout = 10; // Low
              console.log(`[Admin/Operator] Tank ${tank.id} - Low level (fallback): ${daysUntilStockout} days`);
              confidenceLevel = 'low';
            } else {
              daysUntilStockout = 999; // Normal
              console.log(`[Admin/Operator] Tank ${tank.id} - Normal level (fallback): ${daysUntilStockout} days`);
              confidenceLevel = 'low';
            }
          }
        } else {
          // If no sales data, estimate based on fill percentage
          // Tanks with < 20% fill are considered critical (5 days or less)
          const fillPercentage = (currentStock / tankCapacity) * 100;
          console.log(`[Admin/Operator] Tank ${tank.id} - Fill Percentage: ${fillPercentage}`);
          
          if (fillPercentage < 20) {
            daysUntilStockout = 5; // Critical
            console.log(`[Admin/Operator] Tank ${tank.id} - Critical level: ${daysUntilStockout} days`);
          } else if (fillPercentage < 50) {
            daysUntilStockout = 10; // Low
            console.log(`[Admin/Operator] Tank ${tank.id} - Low level: ${daysUntilStockout} days`);
          } else {
            daysUntilStockout = 999; // Normal
            console.log(`[Admin/Operator] Tank ${tank.id} - Normal level: ${daysUntilStockout} days`);
          }
        }
        // Ensure daysUntilStockout is a number
        daysUntilStockout = Number(daysUntilStockout);
        console.log(`[Admin/Operator] Tank ${tank.id} - Final Days Until Stockout: ${daysUntilStockout} (type: ${typeof daysUntilStockout})`);
        
        const predictedStockoutDate = new Date();
        predictedStockoutDate.setDate(predictedStockoutDate.getDate() + daysUntilStockout);
        
        return {
          fuelType: tank.fuel_type,
          currentStock: currentStock,
          tankCapacity: tankCapacity,
          avgDailyConsumption: avgDailyConsumption,
          avgTransactionsPerDay: avgTransactionsPerDay,
          consumptionTrend: consumptionTrend,
          confidenceLevel: confidenceLevel,
          predictedStockoutDate: predictedStockoutDate.toISOString(),
          daysUntilStockout: Number(daysUntilStockout)  // Ensure it's a number
        };
      }));
      console.log('[Admin/Operator] Final stock predictions:', dashboardData.stockPredictions);
      
      // Get recent sales for this SPBU (last 10)
      console.log('Fetching sales for SPBU ID:', spbuId);
      dashboardData.recentSales = await Sale.findAll({
        where: {
          spbu_id: spbuId
        },
        include: [
          {
            model: User,
            as: 'operator',
            attributes: ['name']
          },
          {
            model: SPBU,
            as: 'SPBU',
            attributes: ['name', 'code']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 10
      }).then(sales => {
        console.log('Found sales for SPBU ID', spbuId, ':', sales.map(s => ({
          id: s.id,
          spbu_id: s.spbu_id,
          operator_name: s.operator ? s.operator.name : 'Unknown'
        })));
        return sales.map(sale => ({
          id: sale.id,
          transactionId: sale.transaction_id,
          operatorName: sale.operator ? sale.operator.name : 'Unknown',
          totalAmount: parseFloat(sale.amount),
          litersSold: parseFloat(sale.liters),
          fuel_type: sale.fuel_type,
          spbu: sale.SPBU ? {
            name: sale.SPBU.name,
            code: sale.SPBU.code
          } : null,
          createdAt: sale.created_at
        }));
      });
      
      console.log('[Admin/Operator] Recent sales count:', dashboardData.recentSales.length);
      
      // Get recent deliveries for this SPBU (last 10)
      console.log('Fetching deliveries for SPBU ID:', spbuId);
      dashboardData.recentDeliveries = await Delivery.findAll({
        where: {
          spbu_id: spbuId
        },
        order: [['created_at', 'DESC']],
        limit: 10
      }).then(deliveries => {
        console.log('Found deliveries for SPBU ID', spbuId, ':', deliveries.map(d => ({
          id: d.id,
          spbu_id: d.spbu_id,
          fuel_type: d.fuel_type,
          status: d.status
        })));
        return deliveries.map(delivery => ({
          id: delivery.id,
          supplier: delivery.supplier,
          fuelType: delivery.fuel_type,
          liters: parseFloat(delivery.actual_liters || 0),
          status: delivery.status,
          createdAt: delivery.created_at
        }));
      });
      
      console.log('[Admin/Operator] Recent deliveries count:', dashboardData.recentDeliveries.length);
      
      // Get adjustment metrics for Admin/Operator (filtered by SPBU)
      const adjustments = await Adjustment.findAll({
        where: {
          spbu_id: spbuId
        }
      });
      const totalAdjustments = adjustments.length;
      const totalGain = adjustments
        .filter(item => item.adjustment_type === 'gain' && item.quantity)
        .reduce((sum, item) => sum + parseFloat(item.quantity), 0);
      const totalLoss = adjustments
        .filter(item => item.adjustment_type === 'loss' && item.quantity)
        .reduce((sum, item) => sum + parseFloat(item.quantity), 0);
      const netValue = totalGain - totalLoss;
      
      dashboardData.adjustmentMetrics = {
        totalAdjustments,
        totalGain,
        totalLoss,
        netValue
      };
      
      console.log('=== END ADMIN/OPERATOR DASHBOARD ===');
    }
    
    console.log('=== FINAL DASHBOARD DATA ===');
    console.log('Total Liters:', dashboardData.totalLiters);
    console.log('Tank Stocks Count:', dashboardData.tankStocks.length);
    console.log('Recent Sales Count:', dashboardData.recentSales.length);
    console.log('Recent Deliveries Count:', dashboardData.recentDeliveries.length);
    console.log('=== END FINAL DASHBOARD DATA ===');
    
    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error in getDashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getDashboard
};