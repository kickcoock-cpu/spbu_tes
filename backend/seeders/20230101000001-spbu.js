'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('spbus', [
      {
        name: 'SPBU 123456789',
        location: 'Jl. Sudirman No. 1, Jakarta Pusat',
        code: 'SPBU-001',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'SPBU 987654321',
        location: 'Jl. Thamrin No. 10, Jakarta Pusat',
        code: 'SPBU-002',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'SPBU 456789123',
        location: 'Jl. Gatot Subroto No. 50, Jakarta Selatan',
        code: 'SPBU-003',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'SPBU 321654987',
        location: 'Jl. HR Rasuna Said No. 20, Jakarta Selatan',
        code: 'SPBU-004',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'SPBU 789123456',
        location: 'Jl. Diponegoro No. 30, Jakarta Pusat',
        code: 'SPBU-005',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('spbus', null, {});
  }
};