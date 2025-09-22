'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('deliveries', {
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
      supplier: {
        type: Sequelize.STRING(100),
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
      delivery_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'approved'),
        defaultValue: 'pending'
      },
      confirmed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('deliveries');
  }
};