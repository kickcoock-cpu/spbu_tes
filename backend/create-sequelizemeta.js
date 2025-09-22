const mysql = require('mysql2');

// Database configuration from .env
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'v4'
};

console.log('Attempting to create SequelizeMeta table...');

const connection = mysql.createConnection(config);

const createTableQuery = `
CREATE TABLE IF NOT EXISTS SequelizeMeta (
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
`;

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Successfully connected to MySQL database!');
  
  connection.query(createTableQuery, (err, results) => {
    if (err) {
      console.error('Error creating SequelizeMeta table:', err.message);
      connection.end();
      process.exit(1);
    }
    
    console.log('SequelizeMeta table created or already exists');
    connection.end();
  });
});