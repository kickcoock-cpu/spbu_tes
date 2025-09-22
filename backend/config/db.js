const { Sequelize } = require('sequelize');
require('dotenv').config();

// Konfigurasi koneksi database - mendukung baik MySQL maupun PostgreSQL (Supabase)
let sequelize;

try {
  const isPostgres = process.env.DB_DIALECT === 'postgres';

  sequelize = new Sequelize(
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

  console.log(`Database configured for ${isPostgres ? 'PostgreSQL' : 'MySQL'}`);
} catch (error) {
  console.error('Error configuring database:', error);
  throw error;
}

// Fungsi untuk menguji koneksi
const connectDB = async () => {
  try {
    // Cek apakah dependensi tersedia
    if (process.env.DB_DIALECT === 'postgres') {
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

    await sequelize.authenticate();
    console.log(`Koneksi database berhasil terestablish dengan ${process.env.DB_DIALECT === 'postgres' ? 'Supabase/PostgreSQL' : 'MySQL'}.`);
    
    // Jika SYNC_DATABASE diatur ke true, sinkronkan model
    if (process.env.SYNC_DATABASE === 'true') {
      await sequelize.sync({ alter: true });
      console.log('Semua model telah disinkronkan.');
    }
  } catch (error) {
    console.error(`Tidak dapat terhubung ke database ${process.env.DB_DIALECT === 'postgres' ? 'Supabase/PostgreSQL' : 'MySQL'}:`, error);
    throw error;
  }
};

module.exports = { sequelize, connectDB };