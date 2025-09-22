const { User } = require('./models');

async function checkUsers() {
  try {
    const users = await User.findAll();
    console.log('Existing users:');
    users.forEach(u => {
      console.log(`  ID: ${u.id}, Name: ${u.name}, Email: ${u.email}`);
    });
  } catch (err) {
    console.error(err);
  }
}

checkUsers();