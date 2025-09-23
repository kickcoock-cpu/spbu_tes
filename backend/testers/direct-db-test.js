// Test koneksi database secara langsung dengan pg
const { Client } = require('pg');

async function testDirectConnection() {
  console.log('=== DIRECT DATABASE CONNECTION TEST ===');
  
  // Konfigurasi koneksi
  const config = {
    host: 'aws-0-us-west-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.eqwnpfuuwpdsacyvdrvj',
    password: 'Pertamina1*',
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
  
  console.log('Connection config:');
  console.log('- Host:', config.host);
  console.log('- Port:', config.port);
  console.log('- Database:', config.database);
  console.log('- User:', config.user);
  // Jangan tampilkan password
  
  const client = new Client(config);
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    console.log('Testing simple query...');
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query successful!');
    console.log('Current time:', result.rows[0].current_time);
    
    await client.end();
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.error('=== DIRECT CONNECTION FAILED ===');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
    
    try {
      await client.end();
    } catch (endError) {
      console.error('Error closing connection:', endError.message);
    }
  }
}

// Jalankan test jika file dijalankan langsung
if (require.main === module) {
  testDirectConnection();
}

module.exports = { testDirectConnection };