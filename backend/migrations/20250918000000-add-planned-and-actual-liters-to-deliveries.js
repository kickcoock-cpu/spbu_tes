'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add planned_liters column
    await queryInterface.addColumn('deliveries', 'planned_liters', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null
    });

    // Add actual_liters column
    await queryInterface.addColumn('deliveries', 'actual_liters', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null
    });

    // Copy existing liters data to planned_liters
    await queryInterface.sequelize.query(
      "UPDATE deliveries SET planned_liters = liters"
    );

    // Make planned_liters non-nullable
    await queryInterface.changeColumn('deliveries', 'planned_liters', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    });

    // Remove the old liters column
    await queryInterface.removeColumn('deliveries', 'liters');
  },

  async down (queryInterface, Sequelize) {
    // Add back the liters column
    await queryInterface.addColumn('deliveries', 'liters', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    // Copy planned_liters data back to liters
    await queryInterface.sequelize.query(
      "UPDATE deliveries SET liters = planned_liters"
    );

    // Make liters non-nullable
    await queryInterface.changeColumn('deliveries', 'liters', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    });

    // Remove planned_liters and actual_liters columns
    await queryInterface.removeColumn('deliveries', 'planned_liters');
    await queryInterface.removeColumn('deliveries', 'actual_liters');
  }
};