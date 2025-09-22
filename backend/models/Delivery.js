const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Delivery = sequelize.define('Delivery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  spbu_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  supplier: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  delivery_order_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  delivery_order_photo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  fuel_type: {
    type: DataTypes.ENUM('Premium', 'Pertamax', 'Pertalite', 'Solar', 'Dexlite'),
    allowNull: false
  },
  planned_liters: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  actual_liters: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  delivery_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'approved'),
    defaultValue: 'pending'
  },
  confirmed_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  harga_beli: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  tableName: 'deliveries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Delivery;