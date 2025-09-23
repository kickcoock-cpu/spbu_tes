// Test berbagai kombinasi credential untuk menemukan yang benar
const { Client } = require('pg');

async function testCredentialCombinations() {
  console.log('=== TESTING CREDENTIAL COMBINATIONS ===');
  
  // Kombinasi credential yang akan diuji
  const combinations = [
    {
      name: 'Direct connection with project reference',
      host: 'db.eqwnpfuuwpdsacyvdrvj.supabase.co',
      user: 'postgres.eqwnpfuuwpdsacyvdrvj',
      password: 'Pertamina1*'
    },
    {
      name: 'Pooler connection with project reference',
      host: 'aws-0-us-west-1.pooler.supabase.com',
      user: 'postgres.eqwnpfuuwpdsacyvdrvj',
      password: 'Pertamina1*'
    },
    {
      name: 'Direct connection with postgres user',
      host: 'db.eqwnpfuuwpdsacyvdrvj.supabase.co',
      user: 'postgres',
      password: 'Pertamina1*'
    },
    {
      name: 'Pooler connection with postgres user',
      host: 'aws-0-us-west-1.pooler.supabase.com',
      user: 'postgres',
      password: 'Pertamina1*'
    },
    {
      name: 'Direct connection with wrong project reference',
      host: 'db.wrongprojectreference.supabase.co',
      user: 'postgres.wrongprojectreference',
      password: 'Pertamina1*'
    }
  ];
  
  for (const combo of combinations) {
    console.log(`\n--- Testing: ${combo.name} ---`);
    console.log(`Host: ${combo.host}`);
    console.log(`User: ${combo.user}`);
    
    const client = new Client({
      host: combo.host,
      port: 5432,
      database: 'postgres',
      user: combo.user,
      password: combo.password,
      ssl: {
        require: true,
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
      return; // Jika berhasil, keluar dari fungsi
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      try {
        await client.end();
      } catch (endError) {
        // Abaikan error saat menutup koneksi
      }
    }
  }
  
  console.log('\n=== ALL COMBINATIONS FAILED ===');
}

// Jalankan test jika file dijalankan langsung
if (require.main === module) {
  testCredentialCombinations();
}

module.exports = { testCredentialCombinations };