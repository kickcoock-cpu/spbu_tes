const { Sequelize } = require('sequelize');
require('dotenv').config();

// Konfigurasi koneksi database - mendukung baik MySQL maupun PostgreSQL (Supabase)
let sequelize;

try {
  console.log('=== DATABASE CONFIGURATION START ===');
  
  // Gunakan credential default Supabase untuk testing
  const dbHost = 'db.eqwnpfuuwpdsacyvdrvj.supabase.co';
  const dbUser = 'postgres'; // Gunakan postgres tanpa project reference dulu
  const dbName = 'postgres';
  const dbPassword = 'Pertamina1*';
  const dbPort = 5432;
  
  console.log('Database configuration:');
  console.log('- Host:', dbHost);
  console.log('- User:', dbUser);
  console.log('- Database:', dbName);
  console.log('- Port:', dbPort);

  sequelize = new Sequelize(
    dbName,
    dbUser,
    dbPassword,
    {
      host: dbHost,
      port: dbPort,
      dialect: 'postgres',
      logging: console.log, // Enable logging untuk debugging
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      ssl: true
    }
  );

  console.log('=== DATABASE CONFIGURATION COMPLETE ===');
} catch (error) {
  console.error('=== DATABASE CONFIGURATION ERROR ===');
  console.error('Error configuring database:', error);
  throw error;
}

// Fungsi untuk menguji koneksi
const connectDB = async () => {
  try {
    console.log('=== DATABASE CONNECTION ATTEMPT ===');
    
    // Cek apakah dependensi tersedia
    try {
      require('pg');
      console.log('PostgreSQL driver available');
    } catch (err) {
      console.error('PostgreSQL driver not found. Please install pg package.');
      throw new Error('PostgreSQL driver not found');
    }

    console.log('Attempting to connect to database...');
    console.log('Connection config:', {
      host: sequelize.config.host,
      port: sequelize.config.port,
      database: sequelize.config.database,
      username: sequelize.config.username,
      dialect: sequelize.config.dialect
    });
    
    await sequelize.authenticate();
    console.log('✅ Koneksi database berhasil terestablish dengan Supabase/PostgreSQL.');
    
    // Test query sederhana
    try {
      console.log('Testing database connection with simple query...');
      const result = await sequelize.query('SELECT 1 as test');
      console.log('✅ Database query test successful:', result);
    } catch (queryError) {
      console.error('❌ Database query test failed:', queryError);
    }
  } catch (error) {
    console.error('=== DATABASE CONNECTION ERROR ===');
    console.error('Tidak dapat terhubung ke database Supabase/PostgreSQL:', error);
    throw error;
  }
};

module.exports = { sequelize, connectDB };