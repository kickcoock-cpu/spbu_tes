const mysql = require('mysql2');

// Database configuration from .env
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'v4'
};

console.log('Checking if SequelizeMeta table exists...');

const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Successfully connected to MySQL database!');
  
  connection.query('SHOW TABLES LIKE "SequelizeMeta"', (err, results) => {
    if (err) {
      console.error('Error checking for SequelizeMeta table:', err.message);
      connection.end();
      process.exit(1);
    }
    
    if (results.length > 0) {
      console.log('SequelizeMeta table exists');
    } else {
      console.log('SequelizeMeta table does not exist');
    }
    
    connection.end();
  });
});