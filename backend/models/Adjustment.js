const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Adjustment = sequelize.define('Adjustment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  spbu_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  operator_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('fuel', 'equipment', 'other'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  // Fields for fuel adjustments
  tank_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  adjustment_type: {
    type: DataTypes.ENUM('gain', 'loss'),
    allowNull: true
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rejected_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'adjustments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Adjustment;