'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('sales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      spbu_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'spbus',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      operator_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      pump_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      fuel_type: {
        type: Sequelize.ENUM('Premium', 'Pertamax', 'Pertalite', 'Solar', 'Dexlite'),
        allowNull: false
      },
      liters: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      transaction_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('sales');
  }
};