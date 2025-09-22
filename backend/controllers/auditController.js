const { AuditLog, User } = require('../models');

// @desc    Get all audit logs
// @route   GET /api/audit
// @access  Private (Super Admin: full, Admin: read-only, Operator: none)
const getAudits = async (req, res) => {
  try {
    let audits;
    
    const includeOptions = [
      { model: User, attributes: ['name', 'email'] }
    ];
    
    if (req.user.Role.name === 'Super Admin') {
      // Super Admin sees all audit logs
      audits = await AuditLog.findAll({ 
        include: includeOptions,
        order: [['timestamp', 'DESC']]
      });
    } else if (req.user.Role.name === 'Admin') {
      // Admin sees audit logs related to their SPBU
      // This would require a more complex query to filter by SPBU
      audits = await AuditLog.findAll({ 
        include: includeOptions,
        order: [['timestamp', 'DESC']],
        limit: 100
      });
    }
    
    res.status(200).json({
      success: true,
      count: audits.length,
      data: audits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single audit log
// @route   GET /api/audit/:id
// @access  Private (Super Admin: full, Admin: read-only, Operator: none)
const getAudit = async (req, res) => {
  try {
    const audit = await AuditLog.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['name', 'email'] }]
    });
    
    if (!audit) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: audit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getAudits,
  getAudit
};