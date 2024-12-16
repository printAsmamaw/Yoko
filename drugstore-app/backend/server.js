const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const adminRoutes = require('./routes/admin');
const cashierRoutes = require('./routes/cashier');
const storemanRoutes = require('./routes/storeman');

app.use('/admin', adminRoutes);
app.use('/cashier', cashierRoutes);
app.use('/storeman', storemanRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
