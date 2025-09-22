'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('sales', 'pump_number');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('sales', 'pump_number', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
};