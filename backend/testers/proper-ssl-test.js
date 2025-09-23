// Test koneksi dengan konfigurasi SSL yang benar
const { Client } = require('pg');

async function testWithProperSSL() {
  console.log('=== TESTING WITH PROPER SSL CONFIGURATION ===');
  
  // Konfigurasi dengan SSL yang benar dan password yang benar
  const configs = [
    {
      name: 'Pooler with proper SSL and correct password',
      host: 'aws-0-us-west-1.pooler.supabase.com',
      user: 'postgres.eqwnpfuuwpdsacyvdrvj',
      password: 'RAjevhNTBYzbD9oO', // Password yang benar
      ssl: {
        rejectUnauthorized: false
      }
    },
    {
      name: 'Pooler with postgres user and correct password',
      host: 'aws-0-us-west-1.pooler.supabase.com',
      user: 'postgres',
      password: 'RAjevhNTBYzbD9oO', // Password yang benar
      ssl: {
        rejectUnauthorized: false
      }
    },
    {
      name: 'Direct connection with correct password',
      host: 'db.eqwnpfuuwpdsacyvdrvj.supabase.co',
      user: 'postgres.eqwnpfuuwpdsacyvdrvj',
      password: 'RAjevhNTBYzbD9oO', // Password yang benar
      ssl: {
        rejectUnauthorized: false
      }
    }
  ];
  
  for (const config of configs) {
    console.log(`\n--- Testing: ${config.name} ---`);
    console.log(`Host: ${config.host}`);
    console.log(`User: ${config.user}`);
    console.log(`Password: ${'*'.repeat(config.password.length)}`); // Sembunyikan password
    
    const client = new Client({
      host: config.host,
      port: 5432,
      database: 'postgres',
      user: config.user,
      password: config.password,
      ssl: config.ssl
    });
    
    try {
      await client.connect();
      console.log('✅ SUCCESS: Connected successfully!');
      
      const result = await client.query('SELECT NOW() as current_time');
      console.log('✅ Query successful!');
      console.log('Current time:', result.rows[0].current_time);
      
      await client.end();
      return config; // Return config yang berhasil
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      console.log(`Code: ${error.code}`);
      try {
        await client.end();
      } catch (endError) {
        // Abaikan error saat menutup koneksi
      }
    }
  }
  
  console.log('\n=== NO CONFIGURATION WORKED ===');
  return null;
}

// Jalankan test jika file dijalankan langsung
if (require.main === module) {
  testWithProperSSL().then((correctConfig) => {
    if (correctConfig) {
      console.log(`\n✅ Correct configuration found:`);
      console.log(`Host: ${correctConfig.host}`);
      console.log(`User: ${correctConfig.user}`);
    } else {
      console.log('\n❌ No correct configuration found');
    }
  });
}

module.exports = { testWithProperSSL };