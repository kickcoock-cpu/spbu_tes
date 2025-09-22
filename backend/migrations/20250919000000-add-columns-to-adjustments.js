'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add tank_id column
    await queryInterface.addColumn('adjustments', 'tank_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'tanks',
        key: 'id'
      },
      onDelete: 'SET NULL'
    });

    // Add adjustment_type column
    await queryInterface.addColumn('adjustments', 'adjustment_type', {
      type: Sequelize.ENUM('gain', 'loss'),
      allowNull: true
    });

    // Add quantity column
    await queryInterface.addColumn('adjustments', 'quantity', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove columns in reverse order
    await queryInterface.removeColumn('adjustments', 'quantity');
    await queryInterface.removeColumn('adjustments', 'adjustment_type');
    await queryInterface.removeColumn('adjustments', 'tank_id');
  }
};