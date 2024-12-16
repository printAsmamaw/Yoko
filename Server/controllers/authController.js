const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Signup
exports.signup = async (req, res) => {
    const { employeeId, username, password, role, storeType } = req.body;

    const fetchEmployeeQuery = 'SELECT first_name, last_name FROM employees WHERE id = ?';
    db.query(fetchEmployeeQuery, [employeeId], (err, results) => {
        if (err) {
            console.error('Error fetching employee:', err);
            return res.status(500).send('Server error');
        }

        if (results.length === 0) {
            return res.status(404).send('Employee not found');
        }

        const { first_name, last_name } = results[0];

        const insertUserQuery = `
            INSERT INTO users (fname, lname, username, password, role, storeType) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(insertUserQuery, [first_name, last_name, username, password, role, storeType], (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                return res.status(500).send('Server error');
            }
            res.status(201).send({ message: 'User registered successfully' });
        });
    });
};


exports.signin = (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }
        const user = results[0];
        
        // Directly compare the plain text password
        if (password !== user.password) {
            return res.status(401).send({ message: 'Invalid password' });
        }
        
        const token = jwt.sign({ id: user.id, role: user.role, fname: user.fname, lname: user.lname }, 'secretkey', { expiresIn: '1h' });
        res.status(200).send({ token });
    });
};



// Middleware to verify token and role
const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ message: 'No token provided' });
    }
    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
            return res.status(500).send({ message: 'Failed to authenticate token' });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

