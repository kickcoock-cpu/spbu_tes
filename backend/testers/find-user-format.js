// Test koneksi dengan berbagai format user untuk menemukan yang benar
const { Client } = require('pg');

async function findCorrectUserFormat() {
  console.log('=== FINDING CORRECT USER FORMAT ===');
  
  // Beberapa kemungkinan format user
  const userFormats = [
    'postgres.eqwnpfuuwpdsacyvdrvj', // Format standard
    'postgres', // User default
    'eqwnpfuuwpdsacyvdrvj', // Tanpa prefix postgres
    'postgres_eqwnpfuuwpdsacyvdrvj', // Dengan underscore
    'eqwnpfuuwpdsacyvdrvj_postgres' // Sebaliknya
  ];
  
  const host = 'aws-0-us-west-1.pooler.supabase.com';
  const password = 'Pertamina1*';
  
  for (const user of userFormats) {
    console.log(`\n--- Testing user: ${user} ---`);
    
    const client = new Client({
      host: host,
      port: 5432,
      database: 'postgres',
      user: user,
      password: password,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    try {
      await client.connect();
      console.log(`✅ SUCCESS with user: ${user}`);
      
      const result = await client.query('SELECT NOW() as current_time');
      console.log('✅ Query successful!');
      console.log('Current time:', result.rows[0].current_time);
      
      await client.end();
      return user; // Return user yang berhasil
    } catch (error) {
      console.log(`❌ FAILED with user: ${user} - ${error.message}`);
      try {
        await client.end();
      } catch (endError) {
        // Abaikan error saat menutup koneksi
      }
    }
  }
  
  console.log('\n=== NO USER FORMAT WORKED ===');
  return null;
}

// Jalankan test jika file dijalankan langsung
if (require.main === module) {
  findCorrectUserFormat().then((correctUser) => {
    if (correctUser) {
      console.log(`\n✅ Correct user format found: ${correctUser}`);
    } else {
      console.log('\n❌ No correct user format found');
    }
  });
}

module.exports = { findCorrectUserFormat };