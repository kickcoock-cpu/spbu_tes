const bcrypt = require('bcryptjs');

// Function to hash a password
async function hashPassword() {
  try {
    const password = 'Pertamina1*';
    const saltRounds = 10;
    
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Password:', password);
    console.log('Hashed Password:', hashedPassword);
    
    // Test verification
    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log('Password match:', isMatch);
  } catch (error) {
    console.error('Error:', error);
  }
}

hashPassword();