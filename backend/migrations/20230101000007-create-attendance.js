'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('attendance', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
      check_in: {
        type: Sequelize.DATE,
        allowNull: true
      },
      check_out: {
        type: Sequelize.DATE,
        allowNull: true
      },
      date: {
        type: Sequelize.DATEONLY,
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
    await queryInterface.dropTable('attendance');
  }
};