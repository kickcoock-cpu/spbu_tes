const mysql = require('mysql2');

// Database configuration from .env
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'v4'
};

console.log('Creating spbus table...');

const connection = mysql.createConnection(config);

const createSpbusTableQuery = `
CREATE TABLE IF NOT EXISTS spbus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location TEXT NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
`;

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Successfully connected to MySQL database!');
  
  connection.query(createSpbusTableQuery, (err, results) => {
    if (err) {
      console.error('Error creating spbus table:', err.message);
      connection.end();
      process.exit(1);
    }
    
    console.log('Spbus table created successfully');
    connection.end();
  });
});