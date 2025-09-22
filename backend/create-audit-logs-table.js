const mysql = require('mysql2');

// Database configuration from .env
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'v4'
};

console.log('Creating audit_logs table...');

const connection = mysql.createConnection(config);

const createAuditLogsTableQuery = `
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100) NULL,
  details JSON NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
`;

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Successfully connected to MySQL database!');
  
  connection.query(createAuditLogsTableQuery, (err, results) => {
    if (err) {
      console.error('Error creating audit_logs table:', err.message);
      connection.end();
      process.exit(1);
    }
    
    console.log('Audit_logs table created successfully');
    connection.end();
  });
});