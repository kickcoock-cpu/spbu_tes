const mysql = require('mysql2');

// Database configuration from .env
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'v4'
};

console.log('Creating adjustments table...');

const connection = mysql.createConnection(config);

const createAdjustmentsTableQuery = `
CREATE TABLE IF NOT EXISTS adjustments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  spbu_id INT NOT NULL,
  operator_id INT NULL,
  type ENUM('fuel', 'equipment', 'other') NOT NULL,
  description TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by INT NULL,
  rejected_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (spbu_id) REFERENCES spbus(id) ON DELETE CASCADE,
  FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
`;

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Successfully connected to MySQL database!');
  
  connection.query(createAdjustmentsTableQuery, (err, results) => {
    if (err) {
      console.error('Error creating adjustments table:', err.message);
      connection.end();
      process.exit(1);
    }
    
    console.log('Adjustments table created successfully');
    connection.end();
  });
});