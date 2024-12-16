const db = require('./db'); // Import the db module

// SQL queries
const createRolesTable = `
  CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
  );
`;

const insertRoles = `
  INSERT INTO roles (name) VALUES ('admin'), ('seller')
  ON DUPLICATE KEY UPDATE name = VALUES(name);
`;

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES roles(id)
  );
`;

// Execute the queries
(async () => {
  try {
    await db.query(createRolesTable);
    console.log('Roles table created.');

    await db.query(insertRoles);
    console.log('Roles inserted.');

    await db.query(createUsersTable);
    console.log('Users table created.');

    // Close the pool
    await db.end();
  } catch (err) {
    console.error('Error creating tables:', err);
  }
})();
