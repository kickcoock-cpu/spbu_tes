'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      {
        name: 'Super Admin',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Admin',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Operator',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};