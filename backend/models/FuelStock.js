const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FuelStock = sequelize.define('FuelStock', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  spbu_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fuel_type: {
    type: DataTypes.ENUM('Premium', 'Pertamax', 'Pertalite', 'Solar', 'Dexlite'),
    allowNull: false
  },
  stock: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'fuel_stocks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = FuelStock;