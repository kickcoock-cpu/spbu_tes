// Seeder untuk membuat data awal di Supabase
// Password standardized to 'Pertamina1*' for all users
const { sequelize } = require('../config/db');
const { Role, User, SPBU, Tank } = require('../models');
const bcrypt = require('bcryptjs');

// Data awal untuk seeding
const seedData = {
  roles: [
    { name: 'Super Admin' },
    { name: 'Admin' },
    { name: 'Operator' }
  ],
  
  spbus: [
    {
      name: 'SPBU Pertamina 123456789',
      location: 'Jalan Merdeka No. 123, Jakarta',
      code: 'SPBU-001'
    },
    {
      name: 'SPBU Pertamina 987654321',
      location: 'Jalan Sudirman No. 456, Bandung',
      code: 'SPBU-002'
    }
  ],
  
  users: [
    {
      name: 'Super Administrator',
      username: 'superadmin',
      email: 'superadmin@spbu.com',
      password: 'Pertamina1*', // Standardized password for all users
      role: 'Super Admin',
      spbu_code: null, // Super Admin tidak terikat ke SPBU tertentu
      is_active: true
    },
    {
      name: 'Admin SPBU 1',
      username: 'admin1',
      email: 'admin1@spbu.com',
      password: 'Pertamina1*', // Standardized password for all users
      role: 'Admin',
      spbu_code: 'SPBU-001',
      is_active: true
    },
    {
      name: 'Operator SPBU 1',
      username: 'operator1',
      email: 'operator1@spbu.com',
      password: 'Pertamina1*', // Standardized password for all users
      role: 'Operator',
      spbu_code: 'SPBU-001',
      is_active: true
    },
    {
      name: 'Admin SPBU 2',
      username: 'admin2',
      email: 'admin2@spbu.com',
      password: 'Pertamina1*', // Standardized password for all users
      role: 'Admin',
      spbu_code: 'SPBU-002',
      is_active: true
    },
    {
      name: 'Operator SPBU 2',
      username: 'operator2',
      email: 'operator2@spbu.com',
      password: 'Pertamina1*', // Standardized password for all users
      role: 'Operator',
      spbu_code: 'SPBU-002',
      is_active: true
    }
  ],
  
  tanks: [
    {
      name: 'Tank Premium SPBU 1',
      fuel_type: 'Premium',
      capacity: 10000, // dalam liter
      current_stock: 5000,
      spbu_code: 'SPBU-001'
    },
    {
      name: 'Tank Pertamax SPBU 1',
      fuel_type: 'Pertamax',
      capacity: 8000,
      current_stock: 3000,
      spbu_code: 'SPBU-001'
    },
    {
      name: 'Tank Solar SPBU 1',
      fuel_type: 'Solar',
      capacity: 12000,
      current_stock: 7000,
      spbu_code: 'SPBU-001'
    },
    {
      name: 'Tank Premium SPBU 2',
      fuel_type: 'Premium',
      capacity: 10000,
      current_stock: 6000,
      spbu_code: 'SPBU-002'
    },
    {
      name: 'Tank Pertamax SPBU 2',
      fuel_type: 'Pertamax',
      capacity: 8000,
      current_stock: 4000,
      spbu_code: 'SPBU-002'
    },
    {
      name: 'Tank Solar SPBU 2',
      fuel_type: 'Solar',
      capacity: 12000,
      current_stock: 8000,
      spbu_code: 'SPBU-002'
    }
  ]
};

async function seedDatabase() {
  try {
    console.log('=== STARTING DATABASE SEEDING ===');
    
    // Sinkronkan model
    console.log('Syncing database models...');
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced successfully');
    
    // Seed Roles
    console.log('Seeding roles...');
    for (const roleData of seedData.roles) {
      const [role, created] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData
      });
      
      if (created) {
        console.log(`✅ Created role: ${role.name}`);
      } else {
        console.log(`ℹ️  Role already exists: ${role.name}`);
      }
    }
    
    // Seed SPBUs
    console.log('Seeding SPBUs...');
    const spbuMap = {};
    for (const spbuData of seedData.spbus) {
      const [spbu, created] = await SPBU.findOrCreate({
        where: { code: spbuData.code },
        defaults: spbuData
      });
      
      spbuMap[spbu.code] = spbu.id;
      
      if (created) {
        console.log(`✅ Created SPBU: ${spbu.name} (${spbu.code})`);
      } else {
        console.log(`ℹ️  SPBU already exists: ${spbu.name} (${spbu.code})`);
      }
    }
    
    // Seed Users
    console.log('Seeding users...');
    for (const userData of seedData.users) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Temukan role_id
      const role = await Role.findOne({ where: { name: userData.role } });
      if (!role) {
        console.warn(`⚠️  Role not found: ${userData.role}`);
        continue;
      }
      
      // Temukan spbu_id jika ada
      let spbu_id = null;
      if (userData.spbu_code) {
        spbu_id = spbuMap[userData.spbu_code];
        if (!spbu_id) {
          console.warn(`⚠️  SPBU not found: ${userData.spbu_code}`);
          continue;
        }
      }
      
      const userDefaults = {
        name: userData.name,
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role_id: role.id,
        spbu_id: spbu_id,
        is_active: userData.is_active
      };
      
      const [user, created] = await User.findOrCreate({
        where: { username: userData.username },
        defaults: userDefaults
      });
      
      if (created) {
        console.log(`✅ Created user: ${user.name} (${user.username})`);
      } else {
        console.log(`ℹ️  User already exists: ${user.name} (${user.username})`);
      }
    }
    
    // Seed Tanks
    console.log('Seeding tanks...');
    for (const tankData of seedData.tanks) {
      // Temukan spbu_id
      const spbu_id = spbuMap[tankData.spbu_code];
      if (!spbu_id) {
        console.warn(`⚠️  SPBU not found for tank: ${tankData.spbu_code}`);
        continue;
      }
      
      const tankDefaults = {
        name: tankData.name,
        fuel_type: tankData.fuel_type,
        capacity: tankData.capacity,
        current_stock: tankData.current_stock,
        spbu_id: spbu_id
      };
      
      const [tank, created] = await Tank.findOrCreate({
        where: { 
          name: tankData.name,
          spbu_id: spbu_id 
        },
        defaults: tankDefaults
      });
      
      if (created) {
        console.log(`✅ Created tank: ${tank.name} (${tank.fuel_type}) at SPBU ${tankData.spbu_code}`);
      } else {
        console.log(`ℹ️  Tank already exists: ${tank.name} (${tank.fuel_type}) at SPBU ${tankData.spbu_code}`);
      }
    }
    
    console.log('=== DATABASE SEEDING COMPLETED SUCCESSFULLY ===');
    
  } catch (error) {
    console.error('=== DATABASE SEEDING FAILED ===');
    console.error('Error:', error);
    throw error;
  }
}

// Jalankan seeder jika file dijalankan langsung
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeder completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeder failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };