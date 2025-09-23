const { Client } = require('pg');

// Test the PostgreSQL connection string
const client = new Client({
  connectionString: 'postgresql://postgres.eqwnpfuuwpdsacyvdrvj:RAjevhNTBYzbD9oO@aws-1-us-east-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('Testing PostgreSQL connection...');
    await client.connect();
    console.log('✅ Connection successful!');
    
    // Run a simple query to test
    const result = await client.query('SELECT NOW()');
    console.log('Query result:', result.rows[0]);
    
    await client.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    try {
      await client.end();
    } catch (endError) {
      // Ignore errors when closing connection
    }
  }
}

testConnection();