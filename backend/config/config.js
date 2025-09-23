require('dotenv').config({ path: '.env.vercel' }); // Load .env.vercel file

// Fungsi untuk mendeteksi apakah kita menggunakan PostgreSQL/Supabase
const isPostgres = () => {
  return process.env.DB_DIALECT === 'postgres' || 
         (process.env.DB_HOST && process.env.DB_HOST.includes('supabase')) ||
         (process.env.SUPABASE_URL !== undefined) ||
         (process.env.POSTGRES_URL !== undefined);
};

module.exports = {
  development: {
    username: process.env.DB_USER || (isPostgres() ? 'postgres' : 'root'),
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || (isPostgres() ? 'postgres' : 'spbu_db'),
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || (isPostgres() ? 5432 : 3306),
    dialect: isPostgres() ? 'postgres' : 'mysql',
    logging: false,
    ...(isPostgres() && {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  },
  test: {
    username: process.env.DB_USER || (isPostgres() ? 'postgres' : 'root'),
    password: process.env.DB_PASSWORD || '',
    database: process.env.TEST_DB_NAME || (isPostgres() ? 'postgres' : 'spbu_test'),
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || (isPostgres() ? 5432 : 3306),
    dialect: isPostgres() ? 'postgres' : 'mysql',
    logging: false,
    ...(isPostgres() && {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  },
  production: {
    username: process.env.DB_USER || (isPostgres() ? 'postgres' : 'root'),
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || (isPostgres() ? 'postgres' : 'spbu_db'),
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || (isPostgres() ? 5432 : 3306),
    dialect: isPostgres() ? 'postgres' : 'mysql',
    logging: false,
    ...(isPostgres() && {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  }
};