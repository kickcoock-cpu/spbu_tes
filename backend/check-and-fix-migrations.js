const mysql = require('mysql2');

// Database configuration from .env
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'v4'
};

console.log('Checking which migrations have been run...');

const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Successfully connected to MySQL database!');
  
  // Try to query the sequelizemeta table
  connection.query('SELECT * FROM sequelizemeta', (err, results) => {
    if (err) {
      console.log('sequelizemeta table does not exist or is not accessible');
      console.log('Creating a new sequelizemeta table...');
      
      // Create the table
      const createTableQuery = `
      CREATE TABLE \`sequelizemeta\` (
        \`name\` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
        PRIMARY KEY (\`name\`),
        UNIQUE KEY \`name\` (\`name\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
      `;
      
      connection.query(createTableQuery, (err, results) => {
        if (err) {
          console.error('Error creating sequelizemeta table:', err.message);
          connection.end();
          return;
        }
        
        console.log('sequelizemeta table created successfully');
        checkMigrations(connection);
      });
    } else {
      console.log('Migrations that have been run:');
      results.forEach(row => {
        console.log('-', row.name);
      });
      connection.end();
    }
  });
});

function checkMigrations(connection) {
  // Insert the manually run migrations
  const migrations = [
    '20230101000000-create-roles.js',
    '20230101000001-create-spbu.js',
    '20230101000002-create-users.js'
  ];
  
  const insertQueries = migrations.map(migration => {
    return `INSERT IGNORE INTO sequelizemeta (name) VALUES ('${migration}')`;
  });
  
  // Execute all insert queries
  let completed = 0;
  insertQueries.forEach(query => {
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error inserting migration record:', err.message);
      } else {
        console.log('Successfully inserted migration record for', query.split("'")[1]);
      }
      
      completed++;
      if (completed === insertQueries.length) {
        console.log('All migration records inserted');
        connection.end();
      }
    });
  });
}