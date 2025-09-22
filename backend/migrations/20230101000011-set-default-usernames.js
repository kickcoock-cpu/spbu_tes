'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Update existing users to have a username based on their email
    // This will set username to the part before @ in email
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET username = SUBSTRING_INDEX(email, '@', 1)
      WHERE username IS NULL OR username = ''
    `);
  },

  async down (queryInterface, Sequelize) {
    // In down migration, we don't need to do anything as removing the column will handle this
  }
};