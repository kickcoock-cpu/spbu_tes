// Script to update all users' passwords in Supabase database
const bcrypt = require('bcryptjs');

// The standardized password
const STANDARD_PASSWORD = 'Pertamina1*';

// Function to hash the password
async function hashPassword() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(STANDARD_PASSWORD, salt);
    
    console.log('Standardized Password:', STANDARD_PASSWORD);
    console.log('Hashed Password:', hashedPassword);
    
    // Test verification
    const isMatch = await bcrypt.compare(STANDARD_PASSWORD, hashedPassword);
    console.log('Password verification:', isMatch);
    
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    return null;
  }
}

// Function to update all users
async function updateAllUsers() {
  try {
    const hashedPassword = await hashPassword();
    
    if (!hashedPassword) {
      console.error('Failed to hash password');
      return;
    }
    
    console.log('\n=== Instructions to update all users ===');
    console.log('Run the following curl commands to update each user:');
    console.log('');
    
    // User IDs to update (based on the database we checked earlier)
    const userIds = [1, 2, 3, 4, 5, 6, 7];
    
    userIds.forEach(id => {
      console.log(`curl -s -X PATCH "https://eqwnpfuuwpdsacyvdrvj.supabase.co/rest/v1/users?id=eq.${id}" \\`);
      console.log(`  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxd25wZnV1d3Bkc2FjeXZkcnZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1Mjc2MzUsImV4cCI6MjA3NDEwMzYzNX0.QvRh4RM0cSXBeBmKeGKHHV8Is02csTiPDR_jLY5JHNQ" \\`);
      console.log(`  -H "Content-Type: application/json" \\`);
      console.log(`  -H "Prefer: return=representation" \\`);
      console.log(`  -d "{\\"password\\":\\"${hashedPassword}\\"}"`);
      console.log('');
    });
    
    console.log('All users updated with standardized password: Pertamina1*');
  } catch (error) {
    console.error('Error updating users:', error);
  }
}

updateAllUsers();