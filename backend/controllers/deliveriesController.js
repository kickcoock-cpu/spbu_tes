const { Delivery, SPBU, User, FuelStock, Tank, FuelType } = require('../models');
const { broadcastDashboardUpdate } = require('../utils/broadcastUtils');
const { recordDeliveryTransaction } = require('../utils/ledgerUtils');

// @desc    Get deliveries ready for confirmation (H+1)
// @route   GET /api/deliveries/ready-for-confirmation
// @access  Private (Operator only)
const getDeliveriesReadyForConfirmation = async (req, res) => {
  try {
    // This endpoint is only for Operators
    if (req.user.Role?.name !== 'Operator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is only for Operators.'
      });
    }
    
    // Get current date and yesterday's date
    const currentDate = new Date();
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Set time to beginning of day for comparison
    const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    
    // Get pending deliveries from the operator's SPBU
    const deliveries = await Delivery.findAll({
      where: {
        spbu_id: req.user?.spbu_id,
        status: 'pending'
      },
      include: [
        { 
          model: SPBU, 
          attributes: ['name', 'code']
        },
        {
          model: User,
          as: 'confirmer',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name']
        },
        {
          model: FuelType,
          attributes: ['name']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Filter deliveries that are ready for confirmation (H+1)
    const readyDeliveries = deliveries.filter(delivery => {
      const createdDate = new Date(delivery.created_at);
      const createdDay = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());
      return createdDay <= yesterdayStart;
    });
    
    res.status(200).json({
      success: true,
      count: readyDeliveries.length,
      data: readyDeliveries
    });
  } catch (error) {
    console.error('Error in getDeliveriesReadyForConfirmation:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create delivery
// @route   POST /api/deliveries
// @access  Private (Super Admin: full, Admin: full, Operator: none)
const createDelivery = async (req, res) => {
  try {
    console.log('=== CREATE DELIVERY DEBUG ===');
    console.log('req.user:', req.user);
    console.log('req.user.Role:', req.user.Role);
    console.log('req.user.role:', req.user.role);
    console.log('req.user.Role?.name:', req.user.Role?.name);
    console.log('req.user.role?.[0]:', req.user.role?.[0]);
    console.log('req.body:', req.body);
    console.log('Is Super Admin check (req.user.Role.name === Super Admin):', req.user.Role?.name === 'Super Admin');
    console.log('Is Super Admin check (req.user.role?.includes(Super Admin)):', req.user.role?.includes('Super Admin'));
    
    const { deliveryOrderNumber, fuelType, liters, hargaBeli } = req.body;
    
    // Validate required fields
    if (!fuelType || !liters) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Lock supplier to PT PERTAMINA PATRA NIAGA MADIUN for all deliveries
    const supplier = "PT PERTAMINA PATRA NIAGA MADIUN";
    
    // Get user's SPBU - FIXED VERSION
    let spbuId;
    if (req.user.Role?.name === 'Super Admin') {
      // For Super Admin, spbu_id MUST be provided in request body
      // They cannot use their profile's spbu_id even if it exists
      if (!req.body.spbu_id) {
        console.log('Super Admin must provide spbu_id in request body');
        return res.status(400).json({
          success: false,
          message: 'Super Admin must specify spbu_id in request body'
        });
      }
      spbuId = req.body.spbu_id;
      console.log('Super Admin detected, getting spbu_id from body:', spbuId);
    } else {
      // For other roles, get spbu_id from user profile
      spbuId = req.user?.spbu_id;
      console.log('Non-Super Admin, getting spbu_id from user profile:', spbuId);
    }
    
    console.log('Final spbuId:', spbuId);
    
    if (!spbuId) {
      console.log('SPBU ID is missing or invalid');
      return res.status(400).json({
        success: false,
        message: 'User must be assigned to an SPBU'
      });
    }
    
    // Find fuel type ID
    const fuelTypeRecord = await FuelType.findOne({ where: { name: fuelType } });
    if (!fuelTypeRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fuel type'
      });
    }
    
    // Create delivery
    const deliveryData = {
      spbu_id: spbuId,
      supplier,
      delivery_order_number: deliveryOrderNumber,
      fuel_type_id: fuelTypeRecord.id,
      planned_liters: liters
    };
    
    // Only Super Admin and Admin can set harga_beli
    if ((req.user.Role?.name === 'Super Admin' || req.user.Role?.name === 'Admin') && hargaBeli) {
      deliveryData.harga_beli = hargaBeli;
    }
    
    const delivery = await Delivery.create(deliveryData);
    
    // Get delivery with related data
    const deliveryWithDetails = await Delivery.findByPk(delivery.id, {
      include: [
        { model: SPBU, attributes: ['name', 'code'] },
        { model: FuelType, attributes: ['name'] }
      ]
    });
    
    res.status(201).json({
      success: true,
      data: deliveryWithDetails
    });
  } catch (error) {
    console.error('=== CREATE DELIVERY ERROR ===');
    console.error('Error in createDelivery:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all deliveries
// @route   GET /api/deliveries
// @access  Private (Super Admin: full, Admin: full, Operator: none)
const getDeliveries = async (req, res) => {
  try {
    let deliveries;
    
    const includeOptions = [
      { model: SPBU, attributes: ['name', 'code'] },
      { model: User, as: 'confirmer', attributes: ['name'] },
      { model: User, as: 'approver', attributes: ['name'] },
      { model: FuelType, attributes: ['name'] }
    ];
    
    // Explicitly include all delivery fields including harga_beli
    const attributes = [
      'id',
      'spbu_id',
      'supplier',
      'delivery_order_number',
      'delivery_order_photo',
      'fuel_type_id',
      'planned_liters',
      'actual_liters',
      'delivery_date',
      'status',
      'confirmed_by',
      'approved_by',
      'harga_beli',
      'created_at',
      'updated_at'
    ];
    
    if (req.user.Role?.name === 'Super Admin') {
      // Super Admin sees all deliveries
      deliveries = await Delivery.findAll({ 
        attributes: attributes,
        include: includeOptions 
      });
    } else if (req.user.Role?.name === 'Admin') {
      // Admin sees only deliveries from their SPBU
      deliveries = await Delivery.findAll({ 
        where: { spbu_id: req.user?.spbu_id },
        attributes: attributes,
        include: includeOptions
      });
    }
    
    res.status(200).json({
      success: true,
      count: deliveries.length,
      data: deliveries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single delivery
// @route   GET /api/deliveries/:id
// @access  Private (Super Admin: full, Admin: full, Operator: read-one)
const getDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id, {
      // Explicitly include all delivery fields including harga_beli
      attributes: [
        'id',
        'spbu_id',
        'supplier',
        'delivery_order_number',
        'delivery_order_photo',
        'fuel_type_id',
        'planned_liters',
        'actual_liters',
        'delivery_date',
        'status',
        'confirmed_by',
        'approved_by',
        'harga_beli',
        'created_at',
        'updated_at'
      ],
      include: [
        { model: SPBU, attributes: ['name', 'code'] },
        { model: User, as: 'confirmer', attributes: ['name'] },
        { model: User, as: 'approver', attributes: ['name'] },
        { model: FuelType, attributes: ['name'] }
      ]
    });
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    // Check if user has permission to view this delivery
    // Super Admin can see all deliveries
    // Admin and Operator can only see deliveries from their SPBU
    if ((req.user.Role?.name === 'Admin' || req.user.Role?.name === 'Operator') && 
        delivery.spbu_id !== req.user?.spbu_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this delivery'
      });
    }
    
    res.status(200).json({
      success: true,
      data: delivery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update delivery
// @route   PUT /api/deliveries/:id
// @access  Private (Super Admin: full, Admin: full, Operator: none)
const updateDelivery = async (req, res) => {
  try {
    let delivery = await Delivery.findByPk(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    // Check if user has permission to update this delivery
    if (req.user.Role?.name === 'Admin' && delivery.spbu_id !== req.user?.spbu_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this delivery'
      });
    }
    
    // Prevent updating delivery that has already been confirmed
    if (delivery.status !== 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Cannot update delivery that has already been confirmed'
      });
    }
    
    // Lock supplier to PT PERTAMINA PATRA NIAGA MADIUN for all deliveries
    const supplier = "PT PERTAMINA PATRA NIAGA MADIUN";
    
    // Update delivery with validation
    const { deliveryOrderNumber, fuelType, liters, hargaBeli } = req.body;
    
    // Prepare update data with only allowed fields
    const updateData = {};
    if (fuelType !== undefined) {
      // Find fuel type ID
      const fuelTypeRecord = await FuelType.findOne({ where: { name: fuelType } });
      if (!fuelTypeRecord) {
        return res.status(400).json({
          success: false,
          message: 'Invalid fuel type'
        });
      }
      updateData.fuel_type_id = fuelTypeRecord.id;
    }
    if (deliveryOrderNumber !== undefined) updateData.delivery_order_number = deliveryOrderNumber;
    updateData.supplier = supplier; // Always lock supplier
    
    // Only Super Admin and Admin can update harga_beli
    if ((req.user.Role?.name === 'Super Admin' || req.user.Role?.name === 'Admin') && hargaBeli !== undefined) {
      updateData.harga_beli = hargaBeli;
    }
    
    delivery = await delivery.update(updateData);
    
    // Get updated delivery with related data
    const updatedDelivery = await Delivery.findByPk(delivery.id, {
      include: [
        { model: SPBU, attributes: ['name', 'code'] },
        { model: FuelType, attributes: ['name'] }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: updatedDelivery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Confirm delivery
// @route   PUT /api/deliveries/:id/confirm
// @access  Private (Operator only)
const confirmDelivery = async (req, res) => {
  try {
    let delivery = await Delivery.findByPk(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    // This endpoint is only for Operators
    if (req.user.Role?.name !== 'Operator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is only for Operators.'
      });
    }
    
    // Check if user has permission to confirm this delivery
    if (delivery.spbu_id !== req.user?.spbu_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this delivery'
      });
    }
    
    // Check if it's H+1 (next day) after delivery creation
    const createdDate = new Date(delivery.created_at);
    const currentDate = new Date();
    
    // Set time to beginning of day for comparison
    const createdDay = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());
    const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    // Calculate difference in days
    const timeDiff = currentDay.getTime() - createdDay.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Allow confirmation only on H+1 or later (daysDiff >= 1)
    if (daysDiff < 1) {
      return res.status(403).json({
        success: false,
        message: 'Delivery can only be confirmed starting from the next day (H+1) after creation'
      });
    }
    
    // Get actual liters and harga beli from request body
    // If actualLiters is not provided, use the planned liters
    const actualLiters = req.body.actualLiters ? parseFloat(req.body.actualLiters) : parseFloat(delivery.planned_liters);
    
    // Validate actual liters
    if (actualLiters <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Actual liters must be greater than 0'
      });
    }
    
    // Handle photo upload
    if (req.file) {
      delivery.delivery_order_photo = req.file.path;
    }
    
    // Update delivery with actual liters
    delivery.actual_liters = actualLiters;
    
    // Update harga beli if provided by Operator (only Super Admin and Admin can normally set this)
    // But we allow Operators to set it during confirmation for flexibility
    if (req.body.hargaBeli) {
      delivery.harga_beli = parseFloat(req.body.hargaBeli);
    }
    
    // Update delivery status to confirmed
    delivery.status = 'confirmed';
    delivery.confirmed_by = req.user?.id;
    delivery = await delivery.save();
    
    // Get fuel type name for stock update
    const fuelTypeRecord = await FuelType.findByPk(delivery.fuel_type_id);
    const fuelTypeName = fuelTypeRecord ? fuelTypeRecord.name : 'Unknown';
    
    // Update fuel stock
    const [fuelStock, created] = await FuelStock.findOrCreate({
      where: {
        spbu_id: delivery.spbu_id,
        fuel_type: fuelTypeName
      },
      defaults: {
        spbu_id: delivery.spbu_id,
        fuel_type: fuelTypeName,
        stock: 0
      }
    });
    
    // Add delivered liters to stock (use actual liters)
    fuelStock.stock = parseFloat(fuelStock.stock) + parseFloat(delivery.actual_liters);
    
    await fuelStock.save();
    
    // Update tank stock
    // Find the tank that matches the fuel type and SPBU
    const tank = await Tank.findOne({
      where: {
        spbu_id: delivery.spbu_id,
        fuel_type: fuelTypeName
      }
    });
    
    if (tank) {
      // Add delivered liters to tank's current stock (use actual liters)
      tank.current_stock = parseFloat(tank.current_stock) + parseFloat(delivery.actual_liters);
      await tank.save();
    }
    
    // Get updated delivery with related data
    const updatedDelivery = await Delivery.findByPk(delivery.id, {
      include: [
        { model: SPBU, attributes: ['name', 'code'] },
        { model: FuelType, attributes: ['name'] }
      ]
    });
    
    // Record delivery transaction in ledger
    try {
      await recordDeliveryTransaction({
        spbu_id: delivery.spbu_id,
        id: delivery.id,
        fuel_type: fuelTypeName,
        actual_liters: delivery.actual_liters,
        harga_beli: delivery.harga_beli,
        created_by: req.user?.id
      });
    } catch (ledgerError) {
      console.error('Error recording delivery transaction in ledger:', ledgerError);
      // Continue with the response even if ledger recording fails
    }
    
    // Broadcast dashboard update for real-time updates (only to relevant users)
    await broadcastDashboardUpdate(req.user?.id, delivery.spbu_id, req.user?.Role?.name);
    
    res.status(200).json({
      success: true,
      data: updatedDelivery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Approve delivery
// @route   PUT /api/deliveries/:id/approve
// @access  Private (Deprecated - No longer used)
// NOTE: This function is deprecated as deliveries are now complete after operator confirmation
const approveDelivery = async (req, res) => {
  try {
    return res.status(400).json({
      success: false,
      message: 'This endpoint is deprecated. Deliveries are complete after operator confirmation.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all deliveries for operator (view only)
// @route   GET /api/deliveries/operator
// @access  Private (Operator only)
const getAllDeliveriesForOperator = async (req, res) => {
  try {
    // This endpoint is only for Operators
    if (req.user.Role?.name !== 'Operator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This endpoint is only for Operators.'
      });
    }
    
    // Get all deliveries from the operator's SPBU
    const deliveries = await Delivery.findAll({
      where: {
        spbu_id: req.user?.spbu_id
      },
      // Explicitly include all delivery fields including harga_beli
      attributes: [
        'id',
        'spbu_id',
        'supplier',
        'delivery_order_number',
        'delivery_order_photo',
        'fuel_type_id',
        'planned_liters',
        'actual_liters',
        'delivery_date',
        'status',
        'confirmed_by',
        'approved_by',
        'harga_beli',
        'created_at',
        'updated_at'
      ],
      include: [
        { 
          model: SPBU, 
          attributes: ['name', 'code']
        },
        {
          model: User,
          as: 'confirmer',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name']
        },
        {
          model: FuelType,
          attributes: ['name']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: deliveries.length,
      data: deliveries
    });
  } catch (error) {
    console.error('Error in getAllDeliveriesForOperator:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  createDelivery,
  getDeliveries,
  getDelivery,
  updateDelivery,
  confirmDelivery,
  approveDelivery,
  getDeliveriesReadyForConfirmation,
  getAllDeliveriesForOperator
};