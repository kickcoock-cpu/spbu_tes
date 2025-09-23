// Test koneksi dengan connection string dari Supabase
const { Client } = require('pg');

async function testConnectionString() {
  console.log('=== TESTING CONNECTION STRING ===');
  
  // Connection string dari Supabase (contoh format)
  // postgresql://[user]:[password]@[host]:[port]/[database]
  const connectionString = 'postgresql://postgres:Pertamina1*@aws-0-us-west-1.pooler.supabase.com:5432/postgres';
  
  console.log('Using connection string:');
  console.log(connectionString.replace(/(postgresql:\/\/[^:]+:)([^@]+)/, '$1****')); // Sembunyikan password
  
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false // Izinkan sertifikat self-signed
    }
  });
  
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
    console.error('=== CONNECTION STRING TEST FAILED ===');
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
  testConnectionString();
}

module.exports = { testConnectionString };