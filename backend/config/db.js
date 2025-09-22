const { Sequelize } = require('sequelize');
require('dotenv').config();

// Konfigurasi koneksi database - mendukung baik MySQL maupun PostgreSQL (Supabase)
const isPostgres = process.env.DB_DIALECT === 'postgres';

const sequelize = new Sequelize(
  process.env.DB_NAME || (isPostgres ? 'postgres' : 'spbu_db'),
  process.env.DB_USER || (isPostgres ? 'postgres' : 'root'),
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || (isPostgres ? 5432 : 3306),
    dialect: isPostgres ? 'postgres' : 'mysql',
    logging: false, // Set ke true jika ingin melihat query SQL di console
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    ...(isPostgres && {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  }
);

// Fungsi untuk menguji koneksi
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Koneksi database berhasil terestablish dengan ${isPostgres ? 'Supabase/PostgreSQL' : 'MySQL'}.`);
    
    // Jika SYNC_DATABASE diatur ke true, sinkronkan model
    if (process.env.SYNC_DATABASE === 'true') {
      await sequelize.sync({ alter: true });
      console.log('Semua model telah disinkronkan.');
    }
  } catch (error) {
    console.error(`Tidak dapat terhubung ke database ${isPostgres ? 'Supabase/PostgreSQL' : 'MySQL'}:`, error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };