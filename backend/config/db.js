const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env.vercel' }); // Load .env.vercel file

// Konfigurasi koneksi database - mendukung baik MySQL maupun PostgreSQL (Supabase)
let sequelize;

try {
  console.log('=== DATABASE CONFIGURATION START ===');
  
  // Gunakan connection string jika tersedia
  if (process.env.POSTGRES_URL) {
    console.log('Using connection string for database connection');
    sequelize = new Sequelize(process.env.POSTGRES_URL, {
      logging: console.log, // Enable logging untuk debugging
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });
  } else {
    // Gunakan environment variables yang benar dari .env.vercel
    const dbHost = process.env.DB_HOST || 'aws-1-us-east-1.pooler.supabase.com';
    const dbUser = process.env.DB_USER || 'postgres.eqwnpfuuwpdsacyvdrvj';
    const dbName = process.env.DB_NAME || 'postgres';
    const dbPassword = process.env.DB_PASSWORD || 'RAjevhNTBYzbD9oO';
    const dbPort = process.env.DB_PORT || 6543;
    const dbDialect = process.env.DB_DIALECT || 'postgres';
    
    console.log('Database configuration (final):');
    console.log('- Host:', dbHost);
    console.log('- User:', dbUser);
    console.log('- Database:', dbName);
    console.log('- Port:', dbPort);
    console.log('- Dialect:', dbDialect);

    sequelize = new Sequelize(
      dbName,
      dbUser,
      dbPassword,
      {
        host: dbHost,
        port: parseInt(dbPort),
        dialect: dbDialect,
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
  }

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
      if (sequelize.getDialect() === 'postgres') {
        require('pg');
        console.log('PostgreSQL driver available');
      } else {
        require('mysql2');
        console.log('MySQL driver available');
      }
    } catch (err) {
      console.error('Database driver not found. Please install required driver.');
      throw new Error('Database driver not found');
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
    console.log('✅ Koneksi database berhasil terestablish dengan ' + 
                (sequelize.getDialect() === 'postgres' ? 'Supabase/PostgreSQL' : 'MySQL') + '.');
    
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
    console.error('Tidak dapat terhubung ke database:', error);
    throw error;
  }
};

module.exports = { sequelize, connectDB };