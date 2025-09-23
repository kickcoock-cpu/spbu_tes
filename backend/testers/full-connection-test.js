// Test koneksi dengan connection string lengkap dari Supabase
const { Client } = require('pg');

async function testFullConnectionString() {
  console.log('=== TESTING FULL CONNECTION STRING ===');
  
  // Beberapa kemungkinan connection string
  const connectionStrings = [
    // Format standar dengan project reference
    'postgresql://postgres.eqwnpfuuwpdsacyvdrvj:Pertamina1*@aws-0-us-west-1.pooler.supabase.com:5432/postgres?sslmode=require',
    
    // Format dengan user postgres saja
    'postgresql://postgres:Pertamina1*@aws-0-us-west-1.pooler.supabase.com:5432/postgres?sslmode=require',
    
    // Format dengan direct connection (bukan pooler)
    'postgresql://postgres.eqwnpfuuwpdsacyvdrvj:Pertamina1*@db.eqwnpfuuwpdsacyvdrvj.supabase.co:5432/postgres?sslmode=require',
    
    // Format dengan user postgres dan direct connection
    'postgresql://postgres:Pertamina1*@db.eqwnpfuuwpdsacyvdrvj.supabase.co:5432/postgres?sslmode=require'
  ];
  
  for (const connectionString of connectionStrings) {
    console.log(`\n--- Testing connection string ---`);
    console.log(connectionString.replace(/(:\/\/[^:]+:)([^@]+)/, '$1****')); // Sembunyikan password
    
    const client = new Client({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    try {
      await client.connect();
      console.log('✅ SUCCESS: Connected successfully!');
      
      const result = await client.query('SELECT NOW() as current_time');
      console.log('✅ Query successful!');
      console.log('Current time:', result.rows[0].current_time);
      
      await client.end();
      return connectionString; // Return connection string yang berhasil
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      try {
        await client.end();
      } catch (endError) {
        // Abaikan error saat menutup koneksi
      }
    }
  }
  
  console.log('\n=== NO CONNECTION STRING WORKED ===');
  return null;
}

// Jalankan test jika file dijalankan langsung
if (require.main === module) {
  testFullConnectionString().then((correctConnectionString) => {
    if (correctConnectionString) {
      console.log(`\n✅ Correct connection string found:`);
      console.log(correctConnectionString.replace(/(:\/\/[^:]+:)([^@]+)/, '$1****'));
    } else {
      console.log('\n❌ No correct connection string found');
    }
  });
}

module.exports = { testFullConnectionString };