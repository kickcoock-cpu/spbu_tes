const { Sequelize } = require('sequelize');

// Test database connection with the provided credentials
const sequelize = new Sequelize(
  'postgres',
  'postgres.eqwnpfuuwpdsacyvdrvj',
  'RAjevhNTBYzbD9oO',
  {
    host: 'aws-1-us-east-1.pooler.supabase.com',
    port: 5432,
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    ssl: true
  }
);

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Connection successful!');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    // Let's also try with the pooler URL
    console.log('Trying with full connection string...');
    const sequelize2 = new Sequelize(
      'postgres://postgres.eqwnpfuuwpdsacyvdrvj:RAjevhNTBYzbD9oO@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require',
      {
        dialect: 'postgres',
        logging: console.log,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        ssl: true
      }
    );
    
    try {
      await sequelize2.authenticate();
      console.log('✅ Full connection string successful!');
    } catch (error2) {
      console.error('❌ Full connection string failed:', error2.message);
    }
  } finally {
    await sequelize.close();
  }
}

testConnection();