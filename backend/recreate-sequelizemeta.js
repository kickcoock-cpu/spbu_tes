const mysql = require('mysql2');

// Database configuration from .env
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'v4'
};

console.log('Dropping existing sequelizemeta table and creating SequelizeMeta...');

const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Successfully connected to MySQL database!');
  
  // First drop the existing table
  connection.query('DROP TABLE IF EXISTS sequelizemeta', (err, results) => {
    if (err) {
      console.error('Error dropping table:', err.message);
      connection.end();
      process.exit(1);
    }
    
    console.log('Successfully dropped sequelizemeta table');
    
    // Now create the correctly named table
    const createTableQuery = `
    CREATE TABLE SequelizeMeta (
      name VARCHAR(255) NOT NULL,
      PRIMARY KEY (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    `;
    
    connection.query(createTableQuery, (err, results) => {
      if (err) {
        console.error('Error creating SequelizeMeta table:', err.message);
        connection.end();
        process.exit(1);
      }
      
      console.log('Successfully created SequelizeMeta table');
      connection.end();
    });
  });
});