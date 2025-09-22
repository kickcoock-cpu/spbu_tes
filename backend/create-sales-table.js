const mysql = require('mysql2');

// Database configuration from .env
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'v4'
};

console.log('Creating sales table...');

const connection = mysql.createConnection(config);

const createSalesTableQuery = `
CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  spbu_id INT NOT NULL,
  operator_id INT NOT NULL,
  pump_number INT NOT NULL,
  fuel_type ENUM('Premium', 'Pertamax', 'Pertalite', 'Solar', 'Dexlite') NOT NULL,
  liters DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (spbu_id) REFERENCES spbus(id) ON DELETE CASCADE,
  FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
`;

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Successfully connected to MySQL database!');
  
  connection.query(createSalesTableQuery, (err, results) => {
    if (err) {
      console.error('Error creating sales table:', err.message);
      connection.end();
      process.exit(1);
    }
    
    console.log('Sales table created successfully');
    connection.end();
  });
});