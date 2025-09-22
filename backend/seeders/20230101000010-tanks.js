'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Get SPBU IDs
    const spbus = await queryInterface.sequelize.query(
      'SELECT id, code FROM spbus',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    // Create a map of SPBU codes to IDs
    const spbuMap = {};
    spbus.forEach(spbu => {
      spbuMap[spbu.code] = spbu.id;
    });
    
    // Sample tank data
    const tanks = [
      // SPBU 1 tanks
      {
        spbu_id: spbuMap['SPBU-001'],
        name: 'Premium Tank 1A',
        fuel_type: 'Premium',
        capacity: 10000,
        current_stock: 8500,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        spbu_id: spbuMap['SPBU-001'],
        name: 'Pertamax Tank 1B',
        fuel_type: 'Pertamax',
        capacity: 12000,
        current_stock: 9200,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        spbu_id: spbuMap['SPBU-001'],
        name: 'Solar Tank 1C',
        fuel_type: 'Solar',
        capacity: 8000,
        current_stock: 6500,
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // SPBU 2 tanks
      {
        spbu_id: spbuMap['SPBU-002'],
        name: 'Premium Tank 2A',
        fuel_type: 'Premium',
        capacity: 10000,
        current_stock: 7800,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        spbu_id: spbuMap['SPBU-002'],
        name: 'Pertamax Tank 2B',
        fuel_type: 'Pertamax',
        capacity: 12000,
        current_stock: 10500,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        spbu_id: spbuMap['SPBU-002'],
        name: 'Solar Tank 2C',
        fuel_type: 'Solar',
        capacity: 8000,
        current_stock: 7200,
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // SPBU 3 tanks
      {
        spbu_id: spbuMap['SPBU-003'],
        name: 'Premium Tank 3A',
        fuel_type: 'Premium',
        capacity: 10000,
        current_stock: 9100,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        spbu_id: spbuMap['SPBU-003'],
        name: 'Pertamax Tank 3B',
        fuel_type: 'Pertamax',
        capacity: 12000,
        current_stock: 8800,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        spbu_id: spbuMap['SPBU-003'],
        name: 'Solar Tank 3C',
        fuel_type: 'Solar',
        capacity: 8000,
        current_stock: 6900,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    await queryInterface.bulkInsert('tanks', tanks, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tanks', null, {});
  }
};