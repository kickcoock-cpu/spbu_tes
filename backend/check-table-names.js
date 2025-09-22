const mysql = require('mysql2');

// Database configuration from .env
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'v4'
};

console.log('Checking exact table names...');

const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Successfully connected to MySQL database!');
  
  connection.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('Error getting tables:', err.message);
      connection.end();
      process.exit(1);
    }
    
    console.log('Tables in database:');
    results.forEach(row => {
      const tableName = Object.values(row)[0];
      console.log('-', tableName, '(length:', tableName.length, ')');
    });
    
    connection.end();
  });
});