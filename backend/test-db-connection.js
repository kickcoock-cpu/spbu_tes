// File untuk mengetes koneksi database secara terpisah
const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('Menguji koneksi database...');

// Konfigurasi koneksi database
const isPostgres = process.env.DB_DIALECT === 'postgres';

const sequelize = new Sequelize(
  process.env.DB_NAME || (isPostgres ? 'postgres' : 'spbu_db'),
  process.env.DB_USER || (isPostgres ? 'postgres' : 'root'),
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || (isPostgres ? 5432 : 3306),
    dialect: isPostgres ? 'postgres' : 'mysql',
    logging: false,
    pool: {
      max: 5,
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

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(`Koneksi database berhasil dengan ${isPostgres ? 'PostgreSQL' : 'MySQL'}.`);
    
    // Coba query sederhana
    const [results] = await sequelize.query('SELECT 1+1 as result');
    console.log('Query test berhasil:', results[0].result);
    
    // Tutup koneksi
    await sequelize.close();
    console.log('Koneksi database ditutup.');
    process.exit(0);
  } catch (error) {
    console.error('Koneksi database gagal:', error.message);
    process.exit(1);
  }
}

testConnection();