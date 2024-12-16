const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Example: Register Customer
router.post('/register-customer', auth, (req, res) => {
    const { name, email, phone } = req.body;
    db.query('INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)', [name, email, phone], (err, result) => {
        if (err) throw err;
        res.json({ msg: 'Customer registered' });
    });
});

// Other cashier routes...

module.exports = router;
