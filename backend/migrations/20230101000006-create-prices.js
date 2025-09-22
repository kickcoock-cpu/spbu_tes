'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('prices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      spbu_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'spbus',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      fuel_type: {
        type: Sequelize.ENUM('Premium', 'Pertamax', 'Pertalite', 'Solar', 'Dexlite'),
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      effective_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
    await queryInterface.dropTable('prices');
  }
};