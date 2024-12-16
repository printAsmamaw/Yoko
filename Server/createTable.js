const mysql = require('mysql');
const db = require('./config/db');

const createDrugforPerformaTableQuery = `
CREATE TABLE IF NOT EXISTS performaDrug (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerId INT NOT NULL,
    drugId INT NOT NULL,
    categorieId INT NOT NULL,
    categorie VARCHAR(255) NOT NULL,
    item_measure VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    batchNo VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customerId) REFERENCES customers(id),
    FOREIGN KEY (drugId) REFERENCES drugs(id),
    FOREIGN KEY (categorieId) REFERENCES categories(id)
);
`;

const createPatientsTableQuery = `
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mrn VARCHAR(255) NOT NULL,                -- Medical Record Number
    date_reg DATE NOT NULL,                   -- Date of Registration
    name VARCHAR(255) NOT NULL,               -- Name
    fname VARCHAR(255) NOT NULL,              -- Father's Name
    gfname VARCHAR(255) NOT NULL,             -- Grandfather's Name
    sex ENUM('male', 'female') NOT NULL,      -- Gender
    date_birth DATE NOT NULL,                 -- Date of Birth
    age INT NOT NULL,                         -- Age
    region VARCHAR(255) NOT NULL,             -- Region
    woreda VARCHAR(255) NOT NULL,             -- Woreda
    gott VARCHAR(255) NOT NULL,               -- Gott
    kebele VARCHAR(255) NOT NULL,             -- Kebele
    house_number VARCHAR(255) NOT NULL,       -- House Number
    phone VARCHAR(20) NOT NULL,               -- Phone Number
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createPerformaTableQuery = `
CREATE TABLE IF NOT EXISTS performas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    tel VARCHAR(255) NOT NULL,
    ttn VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createSettingTableQuery = `
CREATE TABLE IF NOT EXISTS settings (
id INT AUTO_INCREMENT PRIMARY KEY,
phoneNumber VARCHAR(255) NOT NULL,
tinNumber VARCHAR(255) NOT NULL,
licenseNumber VARCHAR(255) NOT NULL,
email VARCHAR(255) NOT NULL,
titleAmharic VARCHAR(255) NOT NULL,
titleEnglish VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createSellerTableQuery = `
CREATE TABLE IF NOT EXISTS Seller (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    ttno VARCHAR(255) NOT NULL,
    invoiceNumber VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);
`;
const createItemNameTableQuery = `
CREATE TABLE IF NOT EXISTS itemNames (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    item_code VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createCategoriesTableQuery = `
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL,
    item_measure VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createStocksTableQuery = `
CREATE TABLE IF NOT EXISTS stocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categorieId INT NOT NULL,
    categorie VARCHAR(255) NOT NULL,
    item_measure VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    batchNo VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    sell DECIMAL(10, 2) NOT NULL,
    expiry DATE NOT NULL,
    sellerId INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sellerId) REFERENCES Seller(id),
    FOREIGN KEY (categorieId) REFERENCES categories(id)
);
`;

const createDrugsTableQuery = `
CREATE TABLE IF NOT EXISTS drugs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categorieId INT NOT NULL,
    stockId INT NOT NULL,
    categorie VARCHAR(255) NOT NULL,
    item_measure VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    batchNo VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    sell DECIMAL(10, 2) NOT NULL,
    expiry DATE NOT NULL,
    sellerId INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sellerId) REFERENCES Seller(id),
    FOREIGN KEY (categorieId) REFERENCES categories(id),
    FOREIGN KEY (stockId) REFERENCES stocks(id)
);
`;

const createUsersTableQuery = `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fname VARCHAR(255) NOT NULL,
    lname VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(255) NOT NULL,
    storeType VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createCustomersTableQuery = `
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    tel VARCHAR(255) NOT NULL,
    ttn VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createOrdersTableQuery = `
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerId INT NOT NULL,
    drugId INT NOT NULL,
    categorieId INT NOT NULL,
    categorie VARCHAR(255) NOT NULL,
    item_measure VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    batchNo VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customerId) REFERENCES customers(id),
    FOREIGN KEY (drugId) REFERENCES drugs(id),
    FOREIGN KEY (categorieId) REFERENCES categories(id)
);
`;

const createApprovalTableQuery = `
CREATE TABLE IF NOT EXISTS approvals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerId INT NOT NULL,
    drugId INT NOT NULL,
    categorieId INT NOT NULL,
    categorie VARCHAR(255) NOT NULL,
    item_measure VARCHAR(255) NOT NULL,
    fname VARCHAR(255) NOT NULL,
    lname VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    batchNo VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    status VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customerId) REFERENCES customers(id),
    FOREIGN KEY (drugId) REFERENCES drugs(id),
    FOREIGN KEY (categorieId) REFERENCES categories(id)
);
`;

const createPaymentsTableQuery = `
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerId INT NOT NULL,
    drugId INT NOT NULL,
    userId INT NOT NULL,
    categorieId INT NOT NULL,
    fname VARCHAR(255) NOT NULL,
    lname VARCHAR(255) NOT NULL,
    categorie VARCHAR(255) NOT NULL,
    item_measure VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    batchNo VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unitPrice DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'unpaid',
    paymentMethod VARCHAR(255) NOT NULL,
    outofstock VARCHAR(255) NOT NULL DEFAULT 'no',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customerId) REFERENCES customers(id),
    FOREIGN KEY (drugId) REFERENCES drugs(id),
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (categorieId) REFERENCES categories(id)
);
`;

const createEmployeesTableQuery = `
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    education_level VARCHAR(255),
    address VARCHAR(255),
    department VARCHAR(255),
    surety VARCHAR(255),
    surety_number VARCHAR(20),
    document LONGBLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

db.query(createDrugforPerformaTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating Seller table:', err);
        return;
    }
    console.log('Seller table created successfully:', result);
    
    db.query(createPatientsTableQuery, (err, result) => {
        if (err) {
            console.error('Error creating Seller table:', err);
            return;
        }
        console.log('Seller table created successfully:', result);


db.query(createPerformaTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating Seller table:', err);
        return;
    }
    console.log('Seller table created successfully:', result);


db.query(createSettingTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating Seller table:', err);
        return;
    }
    console.log('Seller table created successfully:', result);

// Create tables in the correct order
db.query(createSellerTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating Seller table:', err);
        return;
    }
    console.log('Seller table created successfully:', result);
    db.query(createItemNameTableQuery, (err, result) => {
        if (err) throw err;
        console.log('Categories table created or already exists');
      });
    
    db.query(createCategoriesTableQuery, (err, result) => {
        if (err) throw err;
        console.log('Categories table created or already exists');
      });
    
      db.query(createStocksTableQuery, (err, result) => {
        if (err) {
            console.error('Error creating stocks table:', err);
            return;
        }
        console.log('Stocks table created successfully:', result);
        db.query(createEmployeesTableQuery, (err, result) => {
            if (err) throw err;
            console.log('Employees table created or already exists');
          });
    db.query(createDrugsTableQuery, (err, result) => {
        if (err) {
            console.error('Error creating drugs table:', err);
            return;
        }
        console.log('Drugs table created successfully:', result);

        db.query(createUsersTableQuery, (err, result) => {
            if (err) {
                console.error('Error creating users table:', err);
                return;
            }
            console.log('Users table created successfully:', result);

            db.query(createCustomersTableQuery, (err, result) => {
                if (err) {
                    console.error('Error creating customers table:', err);
                    return;
                }
                console.log('Customers table created successfully:', result);

                db.query(createOrdersTableQuery, (err, result) => {
                    if (err) {
                        console.error('Error creating orders table:', err);
                        return;
                    }
                    console.log('Orders table created successfully:', result);

                    db.query(createApprovalTableQuery, (err, result) => {
                        if (err) {
                            console.error('Error creating approvals table:', err);
                            return;
                        }
                        console.log('Approvals table created successfully:', result);

                        db.query(createPaymentsTableQuery, (err, result) => {
                            if (err) {
                                console.error('Error creating payments table:', err);
                                return;
                            }
                            console.log('Payments table created successfully:', result);
                                  
                            db.end(); // Close the connection
                        });
                    });
                });
                });
                });
            });
        });
    });
});
});
});
});