const mysql = require('mysql2');

// Database configuration from .env
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'v4'
};

console.log('Creating SequelizeMeta table with correct name and engine...');

const connection = mysql.createConnection(config);

const createSequelizeMetaTableQuery = `
CREATE TABLE IF NOT EXISTS \`SequelizeMeta\` (
  \`name\` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (\`name\`),
  UNIQUE KEY \`name\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
`;

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Successfully connected to MySQL database!');
  
  connection.query(createSequelizeMetaTableQuery, (err, results) => {
    if (err) {
      console.error('Error creating SequelizeMeta table:', err.message);
      connection.end();
      process.exit(1);
    }
    
    console.log('SequelizeMeta table created successfully');
    connection.end();
  });
});