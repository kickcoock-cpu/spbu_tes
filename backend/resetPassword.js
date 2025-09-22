const { User } = require('./models');
const { connectDB } = require('./config/db');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  try {
    await connectDB();
    
    // Find the superadmin user
    const user = await User.findOne({ where: { username: 'superadmin' } });
    
    if (!user) {
      console.log('Super Admin user not found');
      return;
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('superadmin123', salt);
    
    // Update the password
    await user.update({ password: hashedPassword });
    
    console.log('Password for superadmin user has been reset successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

resetPassword();