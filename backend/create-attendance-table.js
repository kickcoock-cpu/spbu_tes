const mysql = require('mysql2');

// Database configuration from .env
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'v4'
};

console.log('Creating attendance table...');

const connection = mysql.createConnection(config);

const createAttendanceTableQuery = `
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  spbu_id INT NOT NULL,
  check_in TIMESTAMP NULL,
  check_out TIMESTAMP NULL,
  date DATE DEFAULT (CURRENT_DATE),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (spbu_id) REFERENCES spbus(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
`;

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Successfully connected to MySQL database!');
  
  connection.query(createAttendanceTableQuery, (err, results) => {
    if (err) {
      console.error('Error creating attendance table:', err.message);
      connection.end();
      process.exit(1);
    }
    
    console.log('Attendance table created successfully');
    connection.end();
  });
});