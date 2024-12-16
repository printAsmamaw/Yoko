const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const drugRoutes = require('./routes/drugRoutes');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');

// const authMiddleware = require('./middlewares/authMiddleware');
const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());
app.use('/api', drugRoutes);
app.use('/patient', patientRoutes);

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/auth', authRoutes);

// app.use('/api/protected', authMiddleware, drugRoutes);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
