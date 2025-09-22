const { Sequelize } = require('sequelize');
require('dotenv').config();

// Konfigurasi koneksi database - mendukung baik MySQL maupun PostgreSQL (Supabase)
let sequelize;

try {
  // Cek apakah kita menggunakan Supabase/PostgreSQL berdasarkan environment
  const isPostgres = process.env.DB_DIALECT === 'postgres' || 
                    (process.env.DB_HOST && process.env.DB_HOST.includes('supabase')) ||
                    (process.env.SUPABASE_URL !== undefined);

  console.log('Database dialect detected:', isPostgres ? 'PostgreSQL' : 'MySQL');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_DIALECT:', process.env.DB_DIALECT);

  // Hardcode values yang benar untuk menghindari masalah environment variables lama
  const dbHost = 'aws-0-us-west-1.pooler.supabase.com';
  const dbUser = 'postgres.eqwnpfuuwpdsacyvdrvj';
  const dbName = 'postgres';
  const dbPassword = 'Pertamina1*';
  const dbPort = 5432;
  
  console.log('Using hardcoded database configuration:');
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
      logging: false, // Set ke true jika ingin melihat query SQL di console
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

  console.log(`Database configured for PostgreSQL/Supabase`);
} catch (error) {
  console.error('Error configuring database:', error);
  throw error;
}

// Fungsi untuk menguji koneksi
const connectDB = async () => {
  try {
    // Cek apakah dependensi tersedia
    if (sequelize.getDialect() === 'postgres') {
      try {
        require('pg');
        console.log('PostgreSQL driver available');
      } catch (err) {
        console.error('PostgreSQL driver not found. Please install pg package.');
        throw new Error('PostgreSQL driver not found');
      }
    } else {
      try {
        require('mysql2');
        console.log('MySQL driver available');
      } catch (err) {
        console.error('MySQL driver not found. Please install mysql2 package.');
        throw new Error('MySQL driver not found');
      }
    }

    console.log('Attempting to connect to database...');
    console.log('Database config:', {
      host: sequelize.config.host,
      port: sequelize.config.port,
      database: sequelize.config.database,
      username: sequelize.config.username,
      dialect: sequelize.config.dialect
    });
    
    await sequelize.authenticate();
    console.log(`Koneksi database berhasil terestablish dengan ${sequelize.getDialect() === 'postgres' ? 'Supabase/PostgreSQL' : 'MySQL'}.`);
    
    // Jika SYNC_DATABASE diatur ke true, sinkronkan model
    if (process.env.SYNC_DATABASE === 'true') {
      await sequelize.sync({ alter: true });
      console.log('Semua model telah disinkronkan.');
    }
  } catch (error) {
    console.error(`Tidak dapat terhubung ke database ${sequelize.getDialect() === 'postgres' ? 'Supabase/PostgreSQL' : 'MySQL'}:`, error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      syscall: error.syscall,
      hostname: error.hostname,
      host: error.host,
      port: error.port
    });
    throw error;
  }
};

module.exports = { sequelize, connectDB };