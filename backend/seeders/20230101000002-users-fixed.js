'use strict';

// Import bcrypt untuk hashing password
const bcrypt = require('bcryptjs');

module.exports = {
  async up (queryInterface, Sequelize) {
    // Get role IDs dynamically
    const roles = await queryInterface.sequelize.query(
      'SELECT id, name FROM roles',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    // Create a map of role names to IDs
    const roleMap = {};
    roles.forEach(role => {
      roleMap[role.name] = role.id;
    });
    
    // Get SPBU IDs dynamically
    const spbus = await queryInterface.sequelize.query(
      'SELECT id, code FROM spbus',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    // Create a map of SPBU codes to IDs
    const spbuMap = {};
    spbus.forEach(spbu => {
      spbuMap[spbu.code] = spbu.id;
    });
    
    // Hash password untuk semua user - menggunakan password yang konsisten
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Pertamina1*', salt);
    
    await queryInterface.bulkInsert('users', [
      // Super Admin
      {
        name: 'Super Admin',
        username: 'superadmin',
        email: 'superadmin@spbu.com',
        password: hashedPassword,
        role_id: roleMap['Super Admin'], // Dynamic Super Admin ID
        spbu_id: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Admin users
      {
        name: 'Admin SPBU 1',
        username: 'admin1',
        email: 'admin1@spbu.com',
        password: hashedPassword,
        role_id: roleMap['Admin'], // Dynamic Admin ID
        spbu_id: spbuMap['SPBU-001'], // Dynamic SPBU ID
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Admin SPBU 2',
        username: 'admin2',
        email: 'admin2@spbu.com',
        password: hashedPassword,
        role_id: roleMap['Admin'], // Dynamic Admin ID
        spbu_id: spbuMap['SPBU-002'], // Dynamic SPBU ID
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Admin SPBU 3',
        username: 'admin3',
        email: 'admin3@spbu.com',
        password: hashedPassword,
        role_id: roleMap['Admin'], // Dynamic Admin ID
        spbu_id: spbuMap['SPBU-003'], // Dynamic SPBU ID
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Operator users
      {
        name: 'Operator SPBU 1A',
        username: 'operator1a',
        email: 'operator1a@spbu.com',
        password: hashedPassword,
        role_id: roleMap['Operator'], // Dynamic Operator ID
        spbu_id: spbuMap['SPBU-001'], // Dynamic SPBU ID
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Operator SPBU 1B',
        username: 'operator1b',
        email: 'operator1b@spbu.com',
        password: hashedPassword,
        role_id: roleMap['Operator'], // Dynamic Operator ID
        spbu_id: spbuMap['SPBU-001'], // Dynamic SPBU ID
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Operator SPBU 2A',
        username: 'operator2a',
        email: 'operator2a@spbu.com',
        password: hashedPassword,
        role_id: roleMap['Operator'], // Dynamic Operator ID
        spbu_id: spbuMap['SPBU-002'], // Dynamic SPBU ID
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Operator SPBU 2B',
        username: 'operator2b',
        email: 'operator2b@spbu.com',
        password: hashedPassword,
        role_id: roleMap['Operator'], // Dynamic Operator ID
        spbu_id: spbuMap['SPBU-002'], // Dynamic SPBU ID
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Operator SPBU 3A',
        username: 'operator3a',
        email: 'operator3a@spbu.com',
        password: hashedPassword,
        role_id: roleMap['Operator'], // Dynamic Operator ID
        spbu_id: spbuMap['SPBU-003'], // Dynamic SPBU ID
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Operator SPBU 3B',
        username: 'operator3b',
        email: 'operator3b@spbu.com',
        password: hashedPassword,
        role_id: roleMap['Operator'], // Dynamic Operator ID
        spbu_id: spbuMap['SPBU-003'], // Dynamic SPBU ID
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};