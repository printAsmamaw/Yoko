const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register User
router.post('/register', (req, res) => {
    const { name, email, password, role } = req.body;
    db.query('SELECT email FROM users WHERE email = ?', [email], (err, results) => {
        if (results.length > 0) {
            return res.status(400).json({ msg: 'User already exists' });
        } else {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) throw err;
                db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hash, role], (err, result) => {
                    if (err) throw err;
                    const payload = { user: { id: result.insertId, role } };
                    jwt.sign(payload, 'secret', { expiresIn: 3600 }, (err, token) => {
                        if (err) throw err;
                        res.json({ token });
                    });
                });
            });
        }
    });
});

// Login User
router.post('/signin', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (results.length === 0) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });
            const payload = { user: { id: user.id, role: user.role } };
            jwt.sign(payload, 'secret', { expiresIn: 3600 }, (err, token) => {
                if (err) throw err;
                res.json({ token });
            });
        });
    });
});

module.exports = router;
