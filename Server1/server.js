const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db'); // Import the db module

const app = express();
app.use(bodyParser.json());
app.use(cors());

const secretKey = 'your_secret_key';

// Register user
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const [rows] = await db.query('SELECT id FROM roles WHERE name = ?', [role]);
        if (rows.length === 0) {
            return res.status(400).send('Invalid role');
        }
        const role_id = rows[0].id;
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (username, password, role_id) VALUES (?, ?, ?)', [username, hashedPassword, role_id]);
        res.send('User registered');
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Server error');
    }
});

// Login user
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.id, role: user.role_id }, secretKey, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).send('Server error');
    }
});

const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization;

    if (token) {
        jwt.verify(token, secretKey, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

app.get('/dashboard', authenticateJWT, (req, res) => {
    if (req.user.role === 1) {
        res.send('Admin Dashboard');
    } else if (req.user.role === 2) {
        res.send('Seller Dashboard');
    } else {
        res.sendStatus(403);
    }
});

app.listen(6000, () => {
    console.log('Server is running on port 6000');
});
