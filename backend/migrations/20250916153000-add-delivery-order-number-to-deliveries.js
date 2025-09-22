'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('deliveries', 'delivery_order_number', {
      type: Sequelize.STRING(50),
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('deliveries', 'delivery_order_number');
  }
};