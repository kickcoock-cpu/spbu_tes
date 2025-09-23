'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // First add the column as nullable
    await queryInterface.addColumn('users', 'username', {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true,
      after: 'name'
    });
    
    // Populate username field with email prefix or generate a username
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET username = SUBSTRING(email, 1, POSITION('@' IN email) - 1)
      WHERE username IS NULL AND email IS NOT NULL
    `);
    
    // For users without email, generate a username
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET username = 'user_' || id
      WHERE username IS NULL
    `);
    
    // Now make the column NOT NULL
    await queryInterface.changeColumn('users', 'username', {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
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