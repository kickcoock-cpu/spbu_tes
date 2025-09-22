const mysql = require('mysql2');

// Database configuration from .env
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'v4'
};

console.log('Discarding tablespace and creating sequelizemeta table...');

const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Successfully connected to MySQL database!');
  
  // First, discard the tablespace
  connection.query('ALTER TABLE sequelizemeta DISCARD TABLESPACE', (err, results) => {
    if (err) {
      console.log('Note: Could not discard tablespace (may not exist):', err.message);
    } else {
      console.log('Tablespace discarded successfully');
    }
    
    // Drop the table if it exists
    connection.query('DROP TABLE IF EXISTS sequelizemeta', (err, results) => {
      if (err) {
        console.error('Error dropping table:', err.message);
        connection.end();
        process.exit(1);
      }
      
      console.log('sequelizemeta table dropped successfully');
      
      // Create the table
      const createSequelizeMetaTableQuery = `
      CREATE TABLE \`sequelizemeta\` (
        \`name\` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        PRIMARY KEY (\`name\`),
        UNIQUE KEY \`name\` (\`name\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
      `;
      
      connection.query(createSequelizeMetaTableQuery, (err, results) => {
        if (err) {
          console.error('Error creating sequelizemeta table:', err.message);
          connection.end();
          process.exit(1);
        }
        
        console.log('sequelizemeta table created successfully');
        connection.end();
      });
    });
  });
});