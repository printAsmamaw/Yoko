const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Example: Get Paid Items
router.get('/paid-items', auth, (req, res) => {
    // Your logic to fetch and return paid items
    res.json({ msg: 'Paid Items' });
});

// Other storeman routes...

module.exports = router;
