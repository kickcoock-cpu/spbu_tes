const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Tank = sequelize.define('Tank', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  spbu_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  fuel_type: {
    type: DataTypes.ENUM('Premium', 'Pertamax', 'Pertalite', 'Solar', 'Dexlite'),
    allowNull: false
  },
  capacity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  current_stock: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
}, {
  tableName: 'tanks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Logical relationship with Price model:
// Tanks and Prices are related through the fuel_type field
// Use the priceHelper functions to get current prices for fuel types

module.exports = Tank;