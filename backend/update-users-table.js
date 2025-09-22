const mysql = require('mysql2');

// Database configuration from .env
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'v4'
};

console.log('Adding username column to users table and making email optional...');

const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Successfully connected to MySQL database!');
  
  // Add username column
  const addUsernameQuery = `
  ALTER TABLE users 
  ADD COLUMN username VARCHAR(50) NOT NULL UNIQUE AFTER name
  `;
  
  connection.query(addUsernameQuery, (err, results) => {
    if (err) {
      console.error('Error adding username column:', err.message);
      // Continue with the next operation even if this fails
    } else {
      console.log('Username column added successfully');
    }
    
    // Make email optional
    const makeEmailOptionalQuery = `
    ALTER TABLE users 
    MODIFY COLUMN email VARCHAR(100) NULL UNIQUE
    `;
    
    connection.query(makeEmailOptionalQuery, (err, results) => {
      if (err) {
        console.error('Error making email optional:', err.message);
        connection.end();
        process.exit(1);
      }
      
      console.log('Email column modified to be optional');
      connection.end();
    });
  });
});