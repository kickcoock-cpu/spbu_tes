// This migration adds transaction_id column to sales table
// Requires uuid package for fallback transaction ID generation
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('sales', 'transaction_id', {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    });
    
    // Add index for better query performance
    await queryInterface.addIndex('sales', ['transaction_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('sales', 'transaction_id');
  }
};