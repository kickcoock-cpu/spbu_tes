const mysql = require('mysql2');

// Database configuration from .env
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'v4'
};

console.log('Renaming sequelizemeta table to SequelizeMeta...');

const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Successfully connected to MySQL database!');
  
  connection.query('RENAME TABLE sequelizemeta TO SequelizeMeta', (err, results) => {
    if (err) {
      console.error('Error renaming table:', err.message);
      connection.end();
      process.exit(1);
    }
    
    console.log('Successfully renamed sequelizemeta to SequelizeMeta');
    connection.end();
  });
});