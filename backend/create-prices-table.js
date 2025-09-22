const mysql = require('mysql2');

// Database configuration from .env
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'v4'
};

console.log('Creating prices table...');

const connection = mysql.createConnection(config);

const createPricesTableQuery = `
CREATE TABLE IF NOT EXISTS prices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  spbu_id INT NULL,
  fuel_type ENUM('Premium', 'Pertamax', 'Pertalite', 'Solar', 'Dexlite') NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  effective_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (spbu_id) REFERENCES spbus(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
`;

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Successfully connected to MySQL database!');
  
  connection.query(createPricesTableQuery, (err, results) => {
    if (err) {
      console.error('Error creating prices table:', err.message);
      connection.end();
      process.exit(1);
    }
    
    console.log('Prices table created successfully');
    connection.end();
  });
});