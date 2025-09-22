'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'username', {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
      after: 'name'
    });
    
    // Make email optional
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING(100),
      allowNull: true,
      unique: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'username');
    
    // Restore email to required
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    });
  }
};