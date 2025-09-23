// Test koneksi dengan password yang berbeda
const { Client } = require('pg');

async function testDifferentPasswords() {
  console.log('=== TESTING DIFFERENT PASSWORDS ===');
  
  // Beberapa kemungkinan password
  const passwords = [
    'Pertamina1*', // Password asli
    'Pertamina1',  // Tanpa asterisk
    'pertamina1*', // Lowercase
    'pertamina1',  // Lowercase tanpa asterisk
    'postgres',    // Default password
    'password',    // Password umum
    'admin',       // Password admin umum
    ''             // Password kosong
  ];
  
  const host = 'aws-0-us-west-1.pooler.supabase.com';
  const user = 'postgres.eqwnpfuuwpdsacyvdrvj';
  
  for (const password of passwords) {
    console.log(`\n--- Testing password: ${password || '(empty)'} ---`);
    
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
      console.log(`✅ SUCCESS with password: ${password || '(empty)'}`);
      
      const result = await client.query('SELECT NOW() as current_time');
      console.log('✅ Query successful!');
      console.log('Current time:', result.rows[0].current_time);
      
      await client.end();
      return password; // Return password yang berhasil
    } catch (error) {
      console.log(`❌ FAILED with password: ${password || '(empty)'} - ${error.message}`);
      try {
        await client.end();
      } catch (endError) {
        // Abaikan error saat menutup koneksi
      }
    }
  }
  
  console.log('\n=== NO PASSWORD WORKED ===');
  return null;
}

// Jalankan test jika file dijalankan langsung
if (require.main === module) {
  testDifferentPasswords().then((correctPassword) => {
    if (correctPassword !== null) {
      console.log(`\n✅ Correct password found: ${correctPassword || '(empty)'}`);
    } else {
      console.log('\n❌ No correct password found');
    }
  });
}

module.exports = { testDifferentPasswords };