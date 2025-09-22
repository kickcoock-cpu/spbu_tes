const mysql = require('mysql2');

// Database configuration from .env
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'v4'
};

console.log('Creating deliveries table...');

const connection = mysql.createConnection(config);

const createDeliveriesTableQuery = `
CREATE TABLE IF NOT EXISTS deliveries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  spbu_id INT NOT NULL,
  supplier VARCHAR(100) NOT NULL,
  fuel_type ENUM('Premium', 'Pertamax', 'Pertalite', 'Solar', 'Dexlite') NOT NULL,
  liters DECIMAL(10, 2) NOT NULL,
  delivery_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'confirmed', 'approved') DEFAULT 'pending',
  confirmed_by INT NULL,
  approved_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (spbu_id) REFERENCES spbus(id) ON DELETE CASCADE,
  FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
`;

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Successfully connected to MySQL database!');
  
  connection.query(createDeliveriesTableQuery, (err, results) => {
    if (err) {
      console.error('Error creating deliveries table:', err.message);
      connection.end();
      process.exit(1);
    }
    
    console.log('Deliveries table created successfully');
    connection.end();
  });
});