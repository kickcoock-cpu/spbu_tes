const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env.vercel' }); // Load .env.vercel file

// Konfigurasi koneksi database untuk Supabase
let sequelize;

try {
  // Gunakan connection string jika tersedia
  if (process.env.POSTGRES_URL) {
    console.log('Using connection string for database connection');
    sequelize = new Sequelize(process.env.POSTGRES_URL, {
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      define: {
        freezeTableName: true,
        timestamps: true
      }
    });
  } else {
    console.log('Using individual environment variables for database connection');
    // Validasi environment variables untuk Supabase
    const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables for Supabase: ${missingEnvVars.join(', ')}`);
    }

    sequelize = new Sequelize(
      process.env.DB_NAME || 'postgres',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
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
        // Untuk kompatibilitas dengan Supabase
        define: {
          freezeTableName: true,
          timestamps: true
        }
      }
    );
  }

  console.log('Database configured for Supabase/PostgreSQL');
} catch (error) {
  console.error('Error configuring Supabase database:', error);
  throw error;
}

// Fungsi untuk menguji koneksi ke Supabase
const connectDB = async () => {
  try {
    // Cek apakah driver PostgreSQL tersedia
    try {
      require('pg');
      console.log('PostgreSQL driver available');
    } catch (err) {
      console.error('PostgreSQL driver not found. Please install pg package.');
      throw new Error('PostgreSQL driver not found');
    }

    console.log('Attempting to connect to Supabase database...');
    await sequelize.authenticate();
    console.log('Koneksi database berhasil terestablish dengan Supabase/PostgreSQL.');
    
    // Jika SYNC_DATABASE diatur ke true, sinkronkan model
    if (process.env.SYNC_DATABASE === 'true') {
      console.log('Syncing database models...');
      await sequelize.sync({ alter: true });
      console.log('Semua model telah disinkronkan.');
    }
  } catch (error) {
    console.error('Tidak dapat terhubung ke database Supabase:', error);
    throw error;
  }
};

module.exports = { sequelize, connectDB };