const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ledgers', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      spbu_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      transaction_type: {
        type: DataTypes.ENUM('sale', 'delivery', 'deposit', 'adjustment', 'expense'),
        allowNull: false
      },
      reference_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      reference_type: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      debit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      credit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      balance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      transaction_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('ledgers', ['spbu_id']);
    await queryInterface.addIndex('ledgers', ['transaction_type']);
    await queryInterface.addIndex('ledgers', ['transaction_date']);
    await queryInterface.addIndex('ledgers', ['created_by']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ledgers');
  }
};