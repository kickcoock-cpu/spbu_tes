'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('deliveries', 'harga_beli', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
      after: 'actual_liters'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('deliveries', 'harga_beli');
  }
};