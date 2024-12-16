const mysql = require('mysql');
const db = require('./config/db');

const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS drugstore`;
const useDatabaseQuery = `USE drugstore`;

const createUsersTableQuery = `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'cashier', 'storeman') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createCustomersTableQuery = `
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createProductsTableQuery = `
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    expiration_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createOrdersTableQuery = `
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    total DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('cash', 'card', 'online') NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
`;

const createOrderItemsTableQuery = `
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
`;

const createSalesReportTableQuery = `
CREATE TABLE IF NOT EXISTS sales_report (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    report_date DATE NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
`;

db.query(createDatabaseQuery, (err, result) => {
    if (err) {
        console.error('Error creating database:', err);
        db.end();
        return;
    }
    console.log('Database created or exists:', result);

    db.query(useDatabaseQuery, (err, result) => {
        if (err) {
            console.error('Error using database:', err);
            db.end();
            return;
        }
        console.log('Using database:', result);

        db.query(createUsersTableQuery, (err, result) => {
            if (err) {
                console.error('Error creating users table:', err);
                db.end();
                return;
            }
            console.log('Users table created successfully:', result);

            db.query(createCustomersTableQuery, (err, result) => {
                if (err) {
                    console.error('Error creating customers table:', err);
                    db.end();
                    return;
                }
                console.log('Customers table created successfully:', result);

                db.query(createProductsTableQuery, (err, result) => {
                    if (err) {
                        console.error('Error creating products table:', err);
                        db.end();
                        return;
                    }
                    console.log('Products table created successfully:', result);

                    db.query(createOrdersTableQuery, (err, result) => {
                        if (err) {
                            console.error('Error creating orders table:', err);
                            db.end();
                            return;
                        }
                        console.log('Orders table created successfully:', result);

                        db.query(createOrderItemsTableQuery, (err, result) => {
                            if (err) {
                                console.error('Error creating order items table:', err);
                                db.end();
                                return;
                            }
                            console.log('Order items table created successfully:', result);

                            db.query(createSalesReportTableQuery, (err, result) => {
                                if (err) {
                                    console.error('Error creating sales report table:', err);
                                    db.end();
                                    return;
                                }
                                console.log('Sales report table created successfully:', result);
                                db.end();
                            });
                        });
                    });
                });
            });
        });
    });
});
