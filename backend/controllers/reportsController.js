const { Sale, Delivery, Deposit, Attendance, SPBU, User, Adjustment, Tank } = require('../models');
const { Op, fn, col, where } = require('sequelize');

// Helper function to build where conditions for reports
const buildReportWhereClause = (req, dateField = 'created_at') => {
  const whereClause = {};
  
  // Add SPBU condition for non-Super Admin users
  if (req.user.Role.name !== 'Super Admin') {
    whereClause.spbu_id = req.user.spbu_id;
  }
  
  // Add date range conditions if provided
  const { startDate, endDate } = req.query;
  if (startDate || endDate) {
    whereClause[dateField] = {};
    if (startDate && startDate !== '') {
      whereClause[dateField][Op.gte] = new Date(startDate);
    }
    if (endDate && endDate !== '') {
      whereClause[dateField][Op.lte] = new Date(endDate);
    }
  }
  
  console.log('Build report where clause result:', whereClause);
  
  return whereClause;
};

// @desc    Get sales report
// @route   GET /api/reports/sales
// @access  Private (Super Admin: full, Admin: full, Operator: limited)
const getSalesReport = async (req, res) => {
  try {
    console.log('Sales report request received with query params:', req.query);
    console.log('User info:', {
      id: req.user.id,
      name: req.user.name,
      role: req.user.Role.name,
      spbu_id: req.user.spbu_id
    });
    
    const whereClause = buildReportWhereClause(req, 'transaction_date');
    
    // Add filter by fuel type if provided
    const { filter, operator } = req.query;
    if (filter && filter !== 'all' && filter !== '') {
      whereClause.fuel_type = filter;
    }
    
    // Add filter by operator if provided
    if (operator && operator !== '' && operator !== 'all') {
      // Handle multiple operators separated by comma
      if (operator.includes(',')) {
        // Split operators and find all matching users
        const operatorNames = operator.split(',').map(op => op.trim());
        const operatorUsers = await User.findAll({
          where: {
            [Op.or]: [  // Change to use OR condition for name or username
              { name: { [Op.in]: operatorNames } },
              { username: { [Op.in]: operatorNames } }
            ]
          }
        });
        
        console.log('Multiple operators filter - operatorNames:', operatorNames, 'operatorUsers found:', operatorUsers.length);
        
        if (operatorUsers.length > 0) {
          whereClause.operator_id = {
            [Op.in]: operatorUsers.map(user => user.id)
          };
        } else {
          // If no operators found, return empty results
          whereClause.operator_id = -1; // This will return no results
        }
      } else {
        // Single operator
        const operatorUser = await User.findOne({
          where: {
            [Op.or]: [  // Change to use OR condition for name or username
              { name: operator },
              { username: operator }
            ]
          }
        });
        
        console.log('Single operator filter - operator:', operator, 'operatorUser found:', !!operatorUser);
        
        if (operatorUser) {
          whereClause.operator_id = operatorUser.id;
        } else {
          // If operator not found, return empty results
          whereClause.operator_id = -1; // This will return no results
        }
      }
    }
    
    console.log('Sales report query parameters:', { filter, operator });
    console.log('Sales report where clause:', whereClause);
    
    // Fetch sales data with related models
    const sales = await Sale.findAll({
      where: whereClause,
      attributes: [
        'id',
        'transaction_id',
        'transaction_date',
        'fuel_type',
        'liters',
        'amount',
        'spbu_id',
        'operator_id'
      ],
      include: [
        {
          model: SPBU,
          attributes: ['name', 'code']
        },
        {
          model: User,
          as: 'operator',
          attributes: ['name', 'username']  // Add username to attributes
        }
      ],
      order: [['transaction_date', 'DESC']]
    });
    
    console.log('Sales report results count:', sales.length);
    // Log first few sales items for inspection
    if (sales.length > 0) {
      console.log('First 3 sales items:', sales.slice(0, 3).map(sale => ({
        id: sale.id,
        operator_id: sale.operator_id,
        operator_name: sale.operator ? sale.operator.name : 'N/A',
        transaction_date: sale.transaction_date,
        fuel_type: sale.fuel_type,
        liters: sale.liters,
        amount: sale.amount
      })));
    }
    
    // Transform data for frontend
    const reportData = sales.map(sale => ({
      id: sale.id,
      transactionId: sale.transaction_id,
      date: sale.transaction_date,
      spbu: sale.SPBU ? `${sale.SPBU.name} (${sale.SPBU.code})` : 'N/A',
      fuelType: sale.fuel_type,
      quantity: parseFloat(sale.liters),
      amount: parseFloat(sale.amount),
      operator: sale.operator ? (sale.operator.username || sale.operator.name) : 'N/A'  // Use username if available, otherwise name
    }));
    
    console.log('Sales report transformed data sample (first 3 items):', reportData.slice(0, 3));
    // Log first item details specifically
    if (reportData.length > 0) {
      const firstItem = reportData[0];
      console.log('First item operator details:', {
        operator: firstItem.operator,
        operatorType: typeof firstItem.operator
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        reportType: 'Sales Report',
        generatedAt: new Date(),
        spbu_id: req.user.Role.name !== 'Super Admin' ? req.user.spbu_id : undefined,
        data: reportData
      }
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get delivery report
// @route   GET /api/reports/deliveries
// @access  Private (Super Admin: full, Admin: full, Operator: limited)
const getDeliveryReport = async (req, res) => {
  try {
    console.log('Delivery report request received with query params:', req.query);
    
    const whereClause = buildReportWhereClause(req, 'delivery_date');
    
    // Add filter by status if provided
    const { filter } = req.query;
    if (filter && filter !== 'all') {
      whereClause.status = filter;
    }
    
    // Fetch delivery data with related models
    const deliveries = await Delivery.findAll({
      where: whereClause,
      include: [
        {
          model: SPBU,
          attributes: ['name', 'code']
        },
        {
          model: User,
          as: 'confirmer',
          attributes: ['name']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['name']
        }
      ],
      order: [['delivery_date', 'DESC']]
    });
    
    // Import Price model
    const { Price } = require('../models');
    
    // Transform data for frontend
    const reportData = [];
    for (const delivery of deliveries) {
      // Get price per liter for this delivery
      const price = await Price.findOne({
        where: {
          spbu_id: delivery.spbu_id,
          fuel_type: delivery.fuel_type
        },
        order: [['created_at', 'DESC']]
      });
      
      const pricePerLiter = price ? parseFloat(price.price) : 0;
      const totalHargaBeli = delivery.actual_liters ? 
        parseFloat(delivery.actual_liters) * pricePerLiter : 
        parseFloat(delivery.planned_liters) * pricePerLiter;
      
      reportData.push({
        id: delivery.id,
        date: delivery.delivery_date,
        spbu: delivery.SPBU ? `${delivery.SPBU.name} (${delivery.SPBU.code})` : 'N/A',
        supplier: delivery.supplier,
        fuelType: delivery.fuel_type,
        planned_liters: parseFloat(delivery.planned_liters),
        actual_liters: delivery.actual_liters ? parseFloat(delivery.actual_liters) : null,
        harga_beli: delivery.harga_beli ? parseFloat(delivery.harga_beli) : null,
        status: delivery.status,
        confirmedBy: delivery.confirmer ? delivery.confirmer.name : 'N/A',
        approvedBy: delivery.approver ? delivery.approver.name : 'N/A',
        totalHargaBeli: totalHargaBeli,
        pricePerLiter: pricePerLiter
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        reportType: 'Delivery Report',
        generatedAt: new Date(),
        spbu_id: req.user.Role.name !== 'Super Admin' ? req.user.spbu_id : undefined,
        data: reportData
      }
    });
  } catch (error) {
    console.error('Error fetching delivery report:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get deposit report
// @route   GET /api/reports/deposits
// @access  Private (Super Admin: full, Admin: full, Operator: limited)
const getDepositReport = async (req, res) => {
  try {
    console.log('Deposit report request received with query params:', req.query);
    
    const whereClause = buildReportWhereClause(req, 'deposit_date');
    
    // Add filter by status if provided
    const { filter } = req.query;
    if (filter && filter !== 'all') {
      whereClause.status = filter;
    }
    
    // Fetch deposit data with related models
    const deposits = await Deposit.findAll({
      where: whereClause,
      include: [
        {
          model: SPBU,
          attributes: ['name', 'code']
        },
        {
          model: User,
          as: 'operator',
          attributes: ['name']
        },
        {
          model: User,
          as: 'depositor_approver',
          attributes: ['name']
        },
        {
          model: User,
          as: 'depositor_rejector',
          attributes: ['name']
        }
      ],
      order: [['deposit_date', 'DESC']]
    });
    
    // Transform data for frontend
    const reportData = deposits.map(deposit => ({
      id: deposit.id,
      date: deposit.deposit_date,
      spbu: deposit.SPBU ? `${deposit.SPBU.name} (${deposit.SPBU.code})` : 'N/A',
      amount: parseFloat(deposit.amount),
      paymentMethod: deposit.payment_method,
      status: deposit.status,
      operator: deposit.operator ? deposit.operator.name : 'N/A',
      approvedBy: deposit.depositor_approver ? deposit.depositor_approver.name : 'N/A',
      rejectedBy: deposit.depositor_rejector ? deposit.depositor_rejector.name : 'N/A'
    }));
    
    res.status(200).json({
      success: true,
      data: {
        reportType: 'Deposit Report',
        generatedAt: new Date(),
        spbu_id: req.user.Role.name !== 'Super Admin' ? req.user.spbu_id : undefined,
        data: reportData
      }
    });
  } catch (error) {
    console.error('Error fetching deposit report:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get attendance report
// @route   GET /api/reports/attendance
// @access  Private (Super Admin: full, Admin: full, Operator: limited)
const getAttendanceReport = async (req, res) => {
  try {
    console.log('Attendance report request received with query params:', req.query);
    
    const whereClause = buildReportWhereClause(req, 'date');
    
    // Fetch attendance data with related models
    const attendances = await Attendance.findAll({
      where: whereClause,
      include: [
        {
          model: SPBU,
          attributes: ['name', 'code']
        },
        {
          model: User,
          attributes: ['name']
        }
      ],
      order: [['date', 'DESC']]
    });
    
    // Transform data for frontend
    const reportData = attendances.map(attendance => ({
      id: attendance.id,
      date: attendance.date,
      spbu: attendance.SPBU ? `${attendance.SPBU.name} (${attendance.SPBU.code})` : 'N/A',
      user: attendance.User ? attendance.User.name : 'N/A',
      checkIn: attendance.check_in,
      checkOut: attendance.check_out
    }));
    
    res.status(200).json({
      success: true,
      data: {
        reportType: 'Attendance Report',
        generatedAt: new Date(),
        spbu_id: req.user.Role.name !== 'Super Admin' ? req.user.spbu_id : undefined,
        data: reportData
      }
    });
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get adjustment report
// @route   GET /api/reports/adjustments
// @access  Private (Super Admin: full, Admin: full)
const getAdjustmentReport = async (req, res) => {
  try {
    console.log('Adjustment report request received with query params:', req.query);
    console.log('User info:', {
      id: req.user.id,
      name: req.user.name,
      role: req.user.Role.name,
      spbu_id: req.user.spbu_id
    });
    
    const whereClause = buildReportWhereClause(req, 'created_at');
    console.log('Adjustment report where clause:', whereClause);
    
    // Add filter by status if provided
    const { status, type, startDate, endDate, spbu } = req.query;
    if (status && status !== 'all' && status !== '') {
      whereClause.status = status;
    }
    
    if (type && type !== 'all' && type !== '') {
      whereClause.type = type;
    }
    
    // Add filter by SPBU if provided (only for Super Admin)
    if (spbu && spbu !== 'all' && spbu !== '' && req.user.Role.name === 'Super Admin') {
      whereClause.spbu_id = spbu;
    }
    
    // Add date range conditions if provided
    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate && startDate !== '') {
        whereClause.created_at[Op.gte] = new Date(startDate);
      }
      if (endDate && endDate !== '') {
        whereClause.created_at[Op.lte] = new Date(endDate);
      }
    }
    
    console.log('Final adjustment report where clause:', whereClause);
    
    // Check if Adjustment model is properly imported
    if (!Adjustment) {
      console.error('Adjustment model is not properly imported');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }
    
    // Fetch adjustment data with related models
    const adjustments = await Adjustment.findAll({
      where: whereClause,
      include: [
        {
          model: SPBU,
          attributes: ['name', 'code']
        },
        {
          model: User,
          as: 'operator',
          attributes: ['name'],
          required: false
        },
        {
          model: User,
          as: 'adjustment_approver',
          attributes: ['name'],
          required: false
        },
        {
          model: User,
          as: 'adjustment_rejector',
          attributes: ['name'],
          required: false
        },
        {
          model: Tank,
          attributes: ['name', 'fuel_type'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    console.log('Adjustments found:', adjustments.length);
    
    // Transform data for frontend
    const reportData = adjustments.map(adjustment => {
      try {
        return {
          id: adjustment.id,
          date: adjustment.created_at,
          spbu: adjustment.SPBU ? `${adjustment.SPBU.name} (${adjustment.SPBU.code})` : 'N/A',
          operator: adjustment.operator ? adjustment.operator.name : 'N/A',
          type: adjustment.type,
          description: adjustment.description,
          status: adjustment.status,
          tank: adjustment.Tank ? `${adjustment.Tank.name} (${adjustment.Tank.fuel_type})` : undefined,
          adjustmentType: adjustment.adjustment_type,
          quantity: adjustment.quantity ? parseFloat(adjustment.quantity) : undefined,
          approvedBy: adjustment.adjustment_approver ? adjustment.adjustment_approver.name : 'N/A',
          rejectedBy: adjustment.adjustment_rejector ? adjustment.adjustment_rejector.name : 'N/A'
        };
      } catch (transformError) {
        console.error('Error transforming adjustment data:', transformError);
        return null;
      }
    }).filter(item => item !== null); // Remove any null items
    
    console.log('Transformed report data:', reportData.slice(0, 3)); // Log first 3 items
    
    res.status(200).json({
      success: true,
      data: {
        reportType: 'Adjustment Report',
        generatedAt: new Date(),
        spbu_id: req.user.Role.name !== 'Super Admin' ? req.user.spbu_id : undefined,
        data: reportData
      }
    });
  } catch (error) {
    console.error('Error fetching adjustment report:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getSalesReport,
  getDeliveryReport,
  getDepositReport,
  getAttendanceReport,
  getAdjustmentReport
};