'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('tanks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      spbu_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      fuel_type: {
        type: Sequelize.ENUM('Premium', 'Pertamax', 'Pertalite', 'Solar', 'Dexlite'),
        allowNull: false
      },
      capacity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      current_stock: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('tanks');
  }
};
