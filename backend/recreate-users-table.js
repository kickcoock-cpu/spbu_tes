const mysql = require('mysql2');

// Database configuration from .env
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'v4'
};

console.log('Recreating users table with username column...');

const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Successfully connected to MySQL database!');
  
  // Drop the existing users table
  const dropUsersQuery = `DROP TABLE IF EXISTS users`;
  
  connection.query(dropUsersQuery, (err, results) => {
    if (err) {
      console.error('Error dropping users table:', err.message);
      connection.end();
      process.exit(1);
    }
    
    console.log('Users table dropped successfully');
    
    // Create the users table with the updated structure
    const createUsersTableQuery = `
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role_id INT NOT NULL,
      spbu_id INT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (spbu_id) REFERENCES spbus(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    `;
    
    connection.query(createUsersTableQuery, (err, results) => {
      if (err) {
        console.error('Error creating users table:', err.message);
        connection.end();
        process.exit(1);
      }
      
      console.log('Users table created successfully with username column');
      connection.end();
    });
  });
});