const { Ledger, SPBU, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const { verifyLedgerBalance, recalculateAllBalances } = require('../utils/ledgerUtils');

// Helper function to build where conditions for ledger reports
const buildLedgerWhereClause = (req) => {
  const whereClause = {};
  
  // Add SPBU condition for non-Super Admin users
  if (req.user.Role.name !== 'Super Admin') {
    whereClause.spbu_id = req.user.spbu_id;
  }
  
  // Add date range conditions if provided
  const { startDate, endDate } = req.query;
  if (startDate || endDate) {
    whereClause.transaction_date = {};
    if (startDate && startDate !== '') {
      whereClause.transaction_date[Op.gte] = new Date(startDate);
    }
    if (endDate && endDate !== '') {
      whereClause.transaction_date[Op.lte] = new Date(endDate);
    }
  }
  
  // Add transaction type filter if provided
  const { transactionType } = req.query;
  if (transactionType && transactionType !== 'all' && transactionType !== '') {
    whereClause.transaction_type = transactionType;
  }
  
  console.log('Build ledger where clause result:', whereClause);
  
  return whereClause;
};

// @desc    Get ledger report
// @route   GET /api/reports/ledger
// @access  Private (Super Admin: full, Admin: full, Operator: limited)
const getLedgerReport = async (req, res) => {
  try {
    console.log('Ledger report request received with query params:', req.query);
    console.log('User info:', {
      id: req.user.id,
      name: req.user.name,
      role: req.user.Role.name,
      spbu_id: req.user.spbu_id
    });
    
    const whereClause = buildLedgerWhereClause(req);
    
    // Fetch ledger data with related models
    const ledgers = await Ledger.findAll({
      where: whereClause,
      include: [
        {
          model: SPBU,
          attributes: ['name', 'code']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['name']
        }
      ],
      order: [['transaction_date', 'ASC'], ['created_at', 'ASC']]
    });
    
    // Transform data for frontend
    const reportData = ledgers.map(ledger => ({
      id: ledger.id,
      date: ledger.transaction_date,
      spbu: ledger.SPBU ? `${ledger.SPBU.name} (${ledger.SPBU.code})` : 'N/A',
      transactionType: ledger.transaction_type,
      referenceId: ledger.reference_id,
      referenceType: ledger.reference_type,
      description: ledger.description,
      debit: parseFloat(ledger.debit),
      credit: parseFloat(ledger.credit),
      balance: parseFloat(ledger.balance),
      createdBy: ledger.creator ? ledger.creator.name : 'N/A'
    }));
    
    // Hitung total credit, debit, dan final balance
    let totalCredit = 0;
    let totalDebit = 0;
    
    if (reportData.length > 0) {
      totalCredit = reportData.reduce((sum, entry) => sum + entry.credit, 0);
      totalDebit = reportData.reduce((sum, entry) => sum + entry.debit, 0);
    }
    
    const finalBalance = totalCredit - totalDebit;
    
    res.status(200).json({
      success: true,
      data: {
        reportType: 'Ledger Report',
        generatedAt: new Date(),
        spbu_id: req.user.Role.name !== 'Super Admin' ? req.user.spbu_id : undefined,
        totals: {
          totalCredit,
          totalDebit,
          finalBalance
        },
        data: reportData
      }
    });
  } catch (error) {
    console.error('Error fetching ledger report:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Add ledger entry
// @route   POST /api/reports/ledger
// @access  Private (Super Admin: full, Admin: full)
const addLedgerEntry = async (req, res) => {
  try {
    const { spbu_id, transaction_type, reference_id, reference_type, description, debit, credit, transaction_date } = req.body;
    
    // Validate required fields
    if (!spbu_id || !transaction_type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: spbu_id, transaction_type, and description are required'
      });
    }
    
    // Check if user has permission to add ledger entry
    if (req.user.Role.name !== 'Super Admin' && req.user.Role.name !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add ledger entries'
      });
    }
    
    // For non-Super Admin users, ensure they can only add entries for their SPBU
    if (req.user.Role.name !== 'Super Admin' && spbu_id !== req.user.spbu_id) {
      return res.status(403).json({
        success: false,
        message: 'You can only add ledger entries for your own SPBU'
      });
    }
    
    // Tentukan tanggal transaksi
    const transactionDate = transaction_date ? new Date(transaction_date) : new Date();
    
    // Hitung balance kumulatif hingga tanggal transaksi
    const balanceResult = await Ledger.findOne({
      where: { 
        spbu_id,
        transaction_date: { [Op.lte]: transactionDate }
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('credit')), 'totalCredit'],
        [sequelize.fn('SUM', sequelize.col('debit')), 'totalDebit']
      ],
      raw: true
    });
    
    const totalCredit = parseFloat(balanceResult.totalCredit) || 0;
    const totalDebit = parseFloat(balanceResult.totalDebit) || 0;
    
    // Rumus yang benar: total credit - total debit = final balance
    const balance = totalCredit - totalDebit;
    
    // Create ledger entry
    const ledgerEntry = await Ledger.create({
      spbu_id,
      transaction_type,
      reference_id: reference_id || null,
      reference_type: reference_type || null,
      description,
      debit: debit || 0,
      credit: credit || 0,
      balance,
      transaction_date: transactionDate,
      created_by: req.user.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Ledger entry added successfully',
      data: ledgerEntry
    });
  } catch (error) {
    console.error('Error adding ledger entry:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Verify ledger balance consistency
// @route   GET /api/reports/ledger/verify
// @access  Private (Super Admin: full, Admin: full)
const verifyLedgerBalanceConsistency = async (req, res) => {
  try {
    const { spbu_id } = req.query;
    
    // Check if user has permission
    if (req.user.Role.name !== 'Super Admin' && req.user.Role.name !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to verify ledger balances'
      });
    }
    
    // For non-Super Admin users, ensure they can only verify their SPBU
    let targetSpbuId = spbu_id;
    if (req.user.Role.name !== 'Super Admin') {
      targetSpbuId = req.user.spbu_id;
    }
    
    if (!targetSpbuId) {
      return res.status(400).json({
        success: false,
        message: 'SPBU ID is required'
      });
    }
    
    // Verify ledger balance
    const verificationResult = await verifyLedgerBalance(targetSpbuId);
    
    res.status(200).json({
      success: true,
      data: verificationResult
    });
  } catch (error) {
    console.error('Error verifying ledger balance:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Recalculate all ledger balances
// @route   POST /api/reports/ledger/recalculate
// @access  Private (Super Admin: full, Admin: full)
const recalculateLedgerBalances = async (req, res) => {
  try {
    const { spbu_id } = req.body;
    
    // Check if user has permission
    if (req.user.Role.name !== 'Super Admin' && req.user.Role.name !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to recalculate ledger balances'
      });
    }
    
    // For non-Super Admin users, ensure they can only recalculate their SPBU
    let targetSpbuId = spbu_id;
    if (req.user.Role.name !== 'Super Admin') {
      targetSpbuId = req.user.spbu_id;
    }
    
    if (!targetSpbuId) {
      return res.status(400).json({
        success: false,
        message: 'SPBU ID is required'
      });
    }
    
    // Recalculate all balances
    const recalculatedCount = await recalculateAllBalances(targetSpbuId);
    
    res.status(200).json({
      success: true,
      message: `Successfully recalculated ${recalculatedCount} ledger entries`,
      data: {
        recalculatedEntries: recalculatedCount
      }
    });
  } catch (error) {
    console.error('Error recalculating ledger balances:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getLedgerReport,
  addLedgerEntry,
  verifyLedgerBalanceConsistency,
  recalculateLedgerBalances
};