const mysql = require('mysql2');

// Database configuration from .env
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'v4'
};

console.log('Attempting to connect to MySQL database...');

const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Successfully connected to MySQL database!');
  
  // Check if database exists
  connection.query('SHOW DATABASES', (err, results) => {
    if (err) {
      console.error('Error fetching databases:', err.message);
      connection.end();
      process.exit(1);
    }
    
    const databases = results.map(row => row.Database);
    console.log('Available databases:', databases);
    
    if (databases.includes('v4')) {
      console.log("Database 'v4' exists");
    } else {
      console.log("Database 'v4' does not exist");
    }
    
    connection.end();
  });
});