const mysql = require('mysql2');

// Database configuration from .env
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'v4'
};

console.log('Creating tanks table...');

const connection = mysql.createConnection(config);

const createTanksTableQuery = `
CREATE TABLE IF NOT EXISTS tanks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  spbu_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  fuel_type ENUM('Premium', 'Pertamax', 'Pertalite', 'Solar', 'Dexlite') NOT NULL,
  capacity DECIMAL(10, 2) NOT NULL,
  current_stock DECIMAL(10, 2) DEFAULT 0,
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
  
  connection.query(createTanksTableQuery, (err, results) => {
    if (err) {
      console.error('Error creating tanks table:', err.message);
      connection.end();
      process.exit(1);
    }
    
    console.log('Tanks table created successfully');
    connection.end();
  });
});