const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Price = sequelize.define('Price', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  spbu_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fuel_type: {
    type: DataTypes.ENUM('Premium', 'Pertamax', 'Pertalite', 'Solar', 'Dexlite'),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  effective_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'prices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Logical relationship with Tank model:
// Tanks and Prices are related through the fuel_type field
// Use the priceHelper functions to get current prices for fuel types

module.exports = Price;