const db = require('../config/db');
const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path'); // Import the path module
const multer = require('multer');

// Set up storage and file handling
const storage = multer.memoryStorage(); // Use memory storage if you want to store files in memory (e.g., for database storage)
const upload = multer({ storage: storage });


// Add Drug
exports.addDrug = async (req, res) => {
  const {
    categorieId,
    categorie,
    item_measure,
    code,
    name,
    batchNo,
    quantity,
    price,
    sell,
    expiry,
    sellerId,
  } = req.body;

  // Query to insert stock data into the stocks table
  const stockQuery = 'INSERT INTO stocks (categorieId, categorie, item_measure, code, name, batchNo, quantity, price, sell, expiry, sellerId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  // Query to insert drug data into the drugs table
  const drugQuery = 'INSERT INTO drugs (categorieId, stockId, categorie, item_measure, code, name, batchNo, quantity, price, sell, expiry, sellerId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  db.beginTransaction((err) => {
    if (err) {
      console.error('Failed to start transaction:', err);
      return res.status(500).json({ error: 'Failed to start transaction' });
    }

    // Insert into the stocks table
    db.query(
      stockQuery,
      [categorieId, categorie, item_measure, code, name, batchNo, quantity, price, sell, expiry, sellerId],
      (err, result) => {
        if (err) {
          console.error('Failed to insert into stocks table:', err);
          return db.rollback(() => {
            res.status(500).json({ error: 'Failed to add stock' });
          });
        }

        // Retrieve the stockId from the result
        const stockId = result.insertId;

        // Insert into the drugs table using the retrieved stockId
        db.query(
          drugQuery,
          [categorieId, stockId, categorie, item_measure, code, name, batchNo, quantity, price, sell, expiry, sellerId],
          (err, result) => {
            if (err) {
              console.error('Failed to insert into drugs table:', err);
              return db.rollback(() => {
                res.status(500).json({ error: 'Failed to add drug' });
              });
            }

            // Commit the transaction
            db.commit((err) => {
              if (err) {
                console.error('Failed to commit transaction:', err);
                return db.rollback(() => {
                  res.status(500).json({ error: 'Failed to commit transaction' });
                });
              }

              res.status(200).json({ message: 'Drug and stock added successfully' });
            });
          }
        );
      }
    );
  });
};



// Add Seller
exports.addSeller = (req, res) => {
  const { name, phone, address, ttno, invoiceNumber, date} = req.body;

  const query = `
    INSERT INTO Seller (name, phone, address, ttno, invoiceNumber, date)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [name, phone, address, ttno, invoiceNumber, date], (err, result) => {
    if (err) {
      console.error('Error adding seller:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    const sellerId = result.insertId;
    res.status(200).json({ id: sellerId });
  });
};

// Get Drugs
exports.getDrugs = (req, res) => {
  const query = 'SELECT * FROM drugs WHERE quantity > 0';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch drugs' });
    }
    res.status(200).json(results);
  });
};

// Get Drug by ID
exports.getDrugById = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM drugs WHERE id = ?';

    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch drug' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Drug not found' });
        }
        res.status(200).json(results[0]);
    });
};

// Get Expired Drugs Count
exports.getExpiredDrugsCount = (req, res) => {
  const query = 'SELECT COUNT(*) AS expiredCount FROM drugs WHERE DATE(expiry) < CURDATE()';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch expired drugs count' });
    }
    res.status(200).json(results[0]);
  });
};


exports.registerperforma = (req, res) => {
  const { name, address, tel, ttn } = req.body;

  const query = 'INSERT INTO performas (name, address, tel, ttn) VALUES (?, ?, ?, ?)';
  
  db.query(query, [name, address, tel, ttn], (err, result) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to register customer' });
      }
      res.status(200).json({ message: 'Customer registered successfully', customerId: result.insertId });
  });
};


// Register Customer
exports.registerCustomer = (req, res) => {
  const { name, address, tel, ttn } = req.body;

  const query = 'INSERT INTO customers (name, address, tel, ttn) VALUES (?, ?, ?, ?)';
  
  db.query(query, [name, address, tel, ttn], (err, result) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to register customer' });
      }
      res.status(200).json({ message: 'Customer registered successfully', customerId: result.insertId });
  });
};


exports.placePerformaDrug = (req, res) => {
  const { customerId, orders } = req.body;

  const query = 'INSERT INTO performadrug (customerId, drugId, categorieId, categorie, item_measure, code, name, batchNo, quantity, price, subtotal, total) VALUES ?';

  const orderValues = orders.map(order => [
    customerId,
    order.drugId,
    order.categorieId,
    order.categorie,
    order.item_measure,
    order.code,
    order.name,
    order.batchNo,
    order.quantity,
    order.price,
    order.subtotal,
    order.total,
  ]);

  db.query(query, [orderValues], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to place order' });
    }
    res.status(200).json({ message: 'Order placed successfully' });
  });
};



// Place Order
exports.placeOrder = (req, res) => {
  const { customerId, orders } = req.body;

  const query = 'INSERT INTO orders (customerId, drugId, categorieId,categorie, item_measure, code, name, batchNo, quantity, price, subtotal, total) VALUES ?';

  const orderValues = orders.map(order => [
    customerId,
    order.drugId,
    order.categorieId,
    order.categorie,
    order.item_measure,
    order.code,
    order.name,
    order.batchNo,
    order.quantity,
    order.price,
    order.subtotal,
    order.total,
  ]);

  db.query(query, [orderValues], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to place order' });
    }
    res.status(200).json({ message: 'Order placed successfully' });
  });
};

// Delete Drug
exports.deleteDrug = (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM drugs WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete drug' });
    }
    res.status(200).json({ message: 'Drug deleted successfully' });
  });
};

// Get Customer Orders
exports.getCustomerOrders = (req, res) => {
  const query = `
      SELECT 
          c.id AS customerId, 
          c.name AS customerName, 
          c.address, 
          c.tel, 
          c.ttn, 
          o.code, 
          o.name AS drugName,
          o.categorie,
          o.item_measure, 
          o.batchNo, 
          o.quantity, 
          o.price, 
          o.subtotal,
          o.drugId,
          o.categorieId
      FROM customers c
      JOIN orders o ON c.id = o.customerId
  `;

  db.query(query, (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to fetch customer orders' });
      }
      res.status(200).json(results);
  }); 
};


// Approve Orders
exports.approvedOrders = (req, res) => {
  const approvedOrders = req.body;

  if (!Array.isArray(approvedOrders) || approvedOrders.length === 0) {
      return res.status(400).send('No orders to approve');
  }

  // Validate each order to ensure required fields are not null
  for (const order of approvedOrders) {
      if (!order.customerId || !order.drugName || !order.fname || !order.lname) {
          return res.status(400).send('Customer ID, Drug Name, First Name, and Last Name are required for all orders');
      }
  }

  const insertApprovalQuery = `
      INSERT INTO approvals 
      (customerId,drugId, categorieId, categorie, item_measure, fname, lname, code, name, batchNo, quantity, price, subtotal, status)
      VALUES ?
  `;

  const values = approvedOrders.map(order => [
      order.customerId,
      order.drugId,
      order.categorieId,
      order.categorie,
      order.item_measure,
      order.fname,
      order.lname,
      order.code,
      order.drugName,
      order.batchNo,
      order.quantity,
      order.price,
      order.subtotal,
      order.approved ? 'Approved' : 'Unapproved'
  ]);

  // Ensure `values` is always an array of arrays, even for a single order
  db.query(insertApprovalQuery, [values], (err, result) => {
      if (err) {
          console.error('Error inserting approvals:', err);
          return res.status(500).send('Error approving orders');
      }
      res.send('Orders approved successfully');
  });
};



// Get Approved Orders
exports.getApprovedOrders = (req, res) => {
  const query = `
        SELECT a.*, c.name AS customerName, c.address, c.tel, c.ttn 
        FROM approvals a
        JOIN customers c ON a.customerId = c.id
        WHERE a.status = 'Approved';
    `;

    db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching approved orders:', err);
          return res.status(500).send('Server error');
      }
      // Group results by customerId
      const groupedResults = results.reduce((acc, current) => {
          (acc[current.customerId] = acc[current.customerId] || []).push(current);
          return acc;
      }, {});
      res.json(groupedResults);
  });
};

// Update Payment Status
exports.updatePaymentStatus = (req, res) => {
  const { id, status } = req.body;
  const query = `UPDATE approvals SET status = ? WHERE id = ?`;

  db.query(query, [status, id], (err, result) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to update payment status' });
      }
      res.status(200).json({ message: 'Payment status updated successfully' });
  });
};


// Finish Payment
exports.finishPayment = (req, res) => {
  const { paymentMethod, orders, firstName, lastName, userId  } = req.body;

  if (!orders.length) {
    return res.status(400).json({ error: 'No paid items found' });
  }

  const values = orders.map(order => {
    const total = order.price * order.quantity;
    return [
      order.customerId,
      order.drugId,
      userId, 
      order.categorieId,
      firstName,        // Add this line
      lastName,
      order.categorie,
      order.item_measure,
      order.code,
      order.name,
      order.batchNo,
      order.quantity,
      order.price,
      total,
      total,
      'paid',
      paymentMethod,
    ];
  });

  const query =
    'INSERT INTO payments (customerId, drugId, userId, categorieId, fname, lname, categorie, item_measure, code, name, batchNo, quantity, unitPrice, subtotal, total, status, paymentMethod) VALUES ?';

  db.query(query, [values], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to finish payment' });
    }
    res.status(200).json({ message: 'Payment completed successfully' });
  });
};

exports.getCustomerforPerforma = (req, res) => {
  const query = 'SELECT * FROM performas';

  db.query(query, (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to fetch customers' });
      }
      res.status(200).json(results);
  });
};


exports.getCustomers = (req, res) => {
  const query = 'SELECT * FROM customers';

  db.query(query, (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to fetch customers' });
      }
      res.status(200).json(results);
  });
};



// controllers/drugController.js

exports.getDailySales = (req, res) => {
  const query = `
      SELECT DATE(created_at) as date, SUM(total) as total
      FROM payments
      WHERE status = 'paid'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at);
  `;
  db.query(query, (err, results) => {
      if (err) {
          console.error('Failed to fetch daily sales data:', err);
          return res.status(500).json({ error: 'Failed to fetch daily sales data' });
      }
      console.log('Daily sales data:', results); // Log the results
      res.status(200).json(results);
  });
};

exports.deleteOrdersByCustomerId = (req, res) => {
  const { customerId } = req.params;

  const query = 'DELETE FROM orders WHERE customerId = ?';

  db.query(query, [customerId], (err, result) => {
    if (err) {
      console.error('Error deleting orders:', err);
      return res.status(500).json({ error: 'Failed to delete orders' });
    }
    res.status(200).json({ message: 'Orders deleted successfully' });
  });
};

// app.delete('/approvals/:customerId', 
  exports.deleteApprovalsByCustomerId=(req, res) => {
  const { customerId } = req.params;

  const query = 'DELETE FROM approvals WHERE customerId = ?';

  db.query(query, [customerId], (err, result) => {
      if (err) {
          console.error('Error deleting approvals:', err);
          return res.status(500).json({ error: 'Failed to delete approvals' });
      }
      res.status(200).json({ message: 'Approvals deleted successfully' });
  });
};

exports.updateDrugsByQuantity = async (req, res) => {
  const { orders } = req.body;

  try {
    for (const order of orders) {
      const { drugId, quantity } = order;
      // Ensure quantity is a positive integer before updating
      if (drugId && quantity > 0) {
        await db.query('UPDATE drugs SET quantity = quantity - ? WHERE id = ?', [quantity, drugId]);
      }
    }
    res.status(200).send('Quantities updated successfully');
  } catch (error) {
    console.error('Error updating drug quantities:', error);
    res.status(500).send('Error updating drug quantities');
  }
};

exports.getPaymentsByCustomerId = (req, res) => {
  const { customerId } = req.params;
  const query = 'SELECT * FROM payments WHERE customerId = ? AND outofstock="no" AND status = "paid"';

  db.query(query, [customerId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch payments' });
    }
    res.status(200).json(results);
  });
};


// Update Drug by ID
exports.updateDrug = (req, res) => {
  const { id } = req.params;
  const { code, name, batchNo, item_measure, quantity, price, sell, expiry } = req.body;

  const query = `
      UPDATE drugs 
      SET code = ?, name = ?, batchNo = ?, item_measure = ?, quantity = ?, price = ?, sell = ?, expiry = ?
      WHERE id = ?`;

  db.query(query, [code, name, batchNo, item_measure, quantity, price, sell, expiry, id], (err, result) => {
      if (err) {
          console.error('Error updating drugs:', err);
          return res.status(500).json({ error: 'Failed to update drug' });
      }
      res.status(200).json({ message: 'Drug updated successfully' });
  });
};


exports.getAllPerformaRequester = (req, res) => {
  const query = 'SELECT * FROM performas';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch sellers' });
    }
    res.status(200).json(results);
  });
};



exports.getAllSellers = (req, res) => {
  const query = 'SELECT * FROM seller';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch sellers' });
    }
    res.status(200).json(results);
  });
};

exports.getAllStocks = (req, res) => {
  const query = `
      SELECT s.name as sellerName, s.id, s.phone, s.address, s.ttno, st.name as drugName, st.code, st.batchNo, st.quantity, st.unit, st.price, (st.price * st.quantity) as totalPrice
      FROM stocks st
      JOIN seller s ON st.sellerId = s.id
  `;

  db.query(query, (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to fetch stocks' });
      }
      res.status(200).json(results);
  });
};

exports.getAllDrugswith = (req, res) => {
  const query = `
      SELECT 
    s.name AS sellerName, 
    s.phone, 
    s.address, 
    s.ttno, 
    st.name AS drugName, 
    st.code, 
    st.batchNo, 
    st.quantity AS purchasedQuantity, 
    st.item_measure, 
    st.price, 
    (st.price * st.quantity) AS totalPrice,
    d.quantity AS currentStock
FROM 
    stocks st
JOIN 
    seller s ON st.sellerId = s.id
JOIN 
    drugs d ON st.id = d.stockId;

  `;

  db.query(query, (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to fetch stocks' });
      }
      res.status(200).json(results);
  });
};


exports.getPerformaDrug = (req, res) => {
  const { sellerId } = req.params;
  const query = `
    SELECT st.id, st.code, st.name, st.batchNo, st.item_measure, st.quantity, st.price, (st.price * st.quantity) as totalPrice
    FROM performadrug st
    WHERE st.customerId = ?
  `;

  db.query(query, [sellerId], (err, results) => {
    if (err) {
      console.error('Error fetching stocks:', err);
      return res.status(500).json({ error: 'Failed to fetch stocks' });
    }
    res.status(200).json(results);
  });
};

// Fetch stocks by sellerId
exports.getStocksBySellerId = (req, res) => {
  const { sellerId } = req.params;
  const query = `
    SELECT st.id, st.code, st.name, st.batchNo, st.item_measure, st.quantity, st.price, (st.price * st.quantity) as totalPrice
    FROM stocks st
    WHERE st.sellerId = ?
  `;

  db.query(query, [sellerId], (err, results) => {
    if (err) {
      console.error('Error fetching stocks:', err);
      return res.status(500).json({ error: 'Failed to fetch stocks' });
    }
    res.status(200).json(results);
  });
};


// Delete Stock by ID
exports.deleteStockById = (req, res) => {
  const { stockId } = req.params;

  const query = 'DELETE FROM stocks WHERE id = ?';

  db.query(query, [stockId], (err, result) => {
    if (err) {
      console.error('Error deleting stock:', err);
      return res.status(500).json({ error: 'Failed to delete stock' });
    }
    res.status(200).json({ message: 'Stock deleted successfully' });
  });
};

// controllers/drugController.js

exports.getTopSellingItems = (req, res) => {
  const query = `
      SELECT name, quantity
      FROM payments
      WHERE status = 'paid'
      GROUP BY name
      ORDER BY quantity DESC
      LIMIT 10;
  `;
  db.query(query, (err, results) => {
      if (err) {
          console.error('Failed to fetch top selling items:', err);
          return res.status(500).json({ error: 'Failed to fetch top selling items' });
      }
      res.status(200).json(results);
  });
};

exports.getReportByCategorie = (req, res) => {
  const query = `
      SELECT categorie, total
      FROM payments
  `;
  db.query(query, (err, results) => {
      if (err) {
          console.error('Failed to fetch top selling items:', err);
          return res.status(500).json({ error: 'Failed to fetch top selling items' });
      }
      res.status(200).json(results);
  });
};
// Get Total Customers for Today
exports.getTotalCustomersForToday = (req, res) => {
  const query = `
    SELECT COUNT(*) AS totalCustomers
    FROM customers
    WHERE DATE(created_at) = CURDATE()
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch total customers for today' });
    }
    res.status(200).json(results[0]);
  });
};
// Get Customers for Today
exports.getCustomersForToday = (req, res) => {
  const query = `
    SELECT * 
    FROM customers
    WHERE DATE(created_at) = CURDATE()
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch customers for today' });
    }
    res.status(200).json(results);
  });
};

// Get Total Medicine for Today
exports.getTotalMedicineForToday = (req, res) => {
  const query = `
    SELECT SUM(quantity) AS totalMedicine
    FROM drugs
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch total customers for today' });
    }
    res.status(200).json(results[0]);
  });
};


exports.getTotalSupplierForToday = (req, res) => {
  const query = `
    SELECT COUNT(*) AS totalSupplier
    FROM seller
    WHERE DATE(created_at) = CURDATE()
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch total customers for today' });
    }
    res.status(200).json(results[0]);
  });
};

exports.getTotalSuppliersForToday = (req, res) => {
  const query = `
    SELECT COUNT(*) AS totalOutofStock
    FROM payments where outofstock='yes'
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch total customers for today' });
    }
    res.status(200).json(results[0]);
  });
};

exports.getTotalExpiredForToday = (req, res) => {
  const query = `
    SELECT SUM(quantity) AS totalExpired
    FROM drugs WHERE DATE(expiry) < CURDATE()
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch total customers for today' });
    }
    res.status(200).json(results[0]);
  });
};

exports.getExpiredForToday = (req, res) => {
  const query = `
    SELECT *
    FROM drugs WHERE DATE(expiry) <= CURDATE()
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch customers for today' });
    }
    res.status(200).json(results);
  });
};


exports.getPerformaUser = (req, res) => {
  const { sellerId } = req.params;
  const query = 'SELECT * FROM performas WHERE id = ?';

  db.query(query, [sellerId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch payments' });
    }
    res.status(200).json(results);
  });
};



exports.getSellers = (req, res) => {
  const { sellerId } = req.params;
  const query = 'SELECT * FROM Seller WHERE id = ?';

  db.query(query, [sellerId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch payments' });
    }
    res.status(200).json(results);
  });
};

exports.getTotalOutOfStockForToday = (req, res) => {
  const {userId} = req.params;

  const query = `
    SELECT SUM(quantity) AS totalOutOfStock
    FROM payments WHERE DATE(created_at) = CURDATE() and userId=?
  `;

  db.query(query,[userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch total customers for today' });
    }
    res.status(200).json(results[0]);
  });
};


exports.getTotalSelledMedicineForToday = (req, res) => {
  const query = `
    SELECT SUM(quantity) AS totalOutOfStock
    FROM payments WHERE DATE(created_at) = CURDATE()
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch total customers for today' });
    }
    res.status(200).json(results[0]);
  });
};


exports.getTotalOutofStock = (req, res) => {
  const query = `
    SELECT SUM(quantity) AS totalOutOfStock
    FROM payments WHERE DATE(created_at) = CURDATE() and outofstock='yes'
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch total customers for today' });
    }
    res.status(200).json(results[0]);
  });
};

exports.getTotalOutofStockButInStock = (req, res) => {
  const query = `
    SELECT SUM(quantity) AS totalOutOfStock
    FROM payments WHERE DATE(created_at) = CURDATE() and outofstock='no'
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch total customers for today' });
    }
    res.status(200).json(results[0]);
  });
};

exports.getSelledMedicine = (req, res) => {
  const query = `
    SELECT c.name AS customerName, c.address, c.tel, c.ttn, 
           pt.name AS drugName, pt.categorie, pt.item_measure, pt.code, pt.batchNo, pt.quantity, pt.unitPrice, pt.subtotal
    FROM payments pt
    JOIN customers c ON pt.customerId = c.id
    WHERE DATE(pt.created_at) = CURDATE()
  `;

  db.query(query, (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to fetch stocks' });
      }
      res.status(200).json(results);
  });
};

exports.getSelledMedicineButInStock = (req, res) => {
  const query = `
    SELECT c.name AS customerName, c.address, c.tel, c.ttn, 
           pt.name AS drugName, pt.categorie, pt.item_measure, pt.code, pt.batchNo, pt.quantity, pt.unitPrice, pt.subtotal
    FROM payments pt
    JOIN customers c ON pt.customerId = c.id
    WHERE DATE(pt.created_at) = CURDATE() and outofstock='no'
  `;

  db.query(query, (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to fetch stocks' });
      }
      res.status(200).json(results);
  });
};

exports.getSelledMedicineByUserId = (req, res) => {
  const {userId} = req.params;
  const query = `
    SELECT c.name AS customerName, c.address, c.tel, c.ttn, 
           pt.name AS drugName, pt.categorie, pt.item_measure, pt.code, pt.batchNo, pt.quantity, pt.unitPrice, pt.subtotal
    FROM payments pt
    JOIN customers c ON pt.customerId = c.id
    WHERE DATE(pt.created_at) = CURDATE() and pt.userId = ?
  `;

  db.query(query, [userId], (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to fetch stocks' });
      }
      res.status(200).json(results);
  });
};


exports.getOutofStockMdicine = (req, res) => {
  const query = `
    SELECT c.name AS customerName, c.address, c.tel, c.ttn, 
           pt.name AS drugName, pt.code, pt.batchNo, pt.quantity, 
           pt.item_measure, pt.unitPrice, pt.subtotal
    FROM payments pt
    JOIN customers c ON pt.customerId = c.id
    WHERE DATE(pt.created_at) = CURDATE() and outofstock='yes'
  `;

  db.query(query, (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to fetch stocks' });
      }
      res.status(200).json(results);
  });
};


exports.getTotalSalesToday = (req, res) => {
  const query = `
    SELECT SUM(quantity * unitPrice) AS totalSales
    FROM payments
    WHERE DATE(created_at) = CURDATE()
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch total sales' });
    }
    res.status(200).json(results[0]);
  });
};

exports.getTotalSalesTodayForIndividualUser = (req, res) => {
  const query = `
    SELECT CONCAT(fname, ' ', lname) AS fullname, SUM(quantity * unitPrice) AS totalSales
    FROM payments
    WHERE DATE(created_at) = CURDATE()
    GROUP BY fullname
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch total sales for individual users' });
    }
    res.status(200).json(results);
  });
};



exports.getTotalSalesTodayByUserId = (req, res) => {
  const {userId} = req.params;

  const query = `
    SELECT SUM(quantity * unitPrice) AS totalSales
    FROM payments
    WHERE DATE(created_at) = CURDATE() and userId=?
  `;

  db.query(query,[userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch total sales' });
    }
    res.status(200).json(results[0]);
  });
};

// In your controller file, e.g., stockController.js

exports.getTotalPurchasesToday = (req, res) => {
  const query = `
    SELECT SUM(quantity * price) AS totalPurchases
    FROM stocks
    WHERE DATE(created_at) = CURDATE()
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch total purchases' });
    }
    res.status(200).json(results[0]);
  });
};


exports.getCategorie = (req, res) => {
  const query = 'SELECT id, category_name, item_measure FROM categories';

  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching categories:', err);
          return res.status(500).json({ error: 'Failed to fetch categories' });
      }
      res.status(200).json(results);
  });
}

exports.getItems = (req, res) => {
  const query = 'SELECT id, item_name, item_code FROM itemNames';

  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching categories:', err);
          return res.status(500).json({ error: 'Failed to fetch categories' });
      }
      res.status(200).json(results);
  });
};


exports.addEmployee = (req, res) => {
  upload.single('document')(req, res, function (err) { // Ensure 'document' matches the name attribute in your file input field
    if (err) {
      return res.status(500).json({ error: 'Failed to upload document' });
    }

    const { first_name, last_name, phone_number, education_level, address, department, surety, surety_number } = req.body;
    const document = req.file ? req.file.buffer : null;

    const query = `
      INSERT INTO employees (first_name, last_name, phone_number, education_level, address, department, surety, surety_number, document)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [first_name, last_name, phone_number, education_level, address, department, surety, surety_number, document], (err, result) => {
      if (err) {
        console.error('Error adding employee:', err);
        return res.status(500).json({ error: 'Failed to add employee' });
      }
      res.status(200).json({ message: 'Employee added successfully' });
    });
  });
};

exports.addCategorie = (req, res) => {
  const { categoryName, itemMeasure } = req.body;

  const query = `
    INSERT INTO categories (category_name, item_measure)
    VALUES (?, ?)
  `;

  db.query(query, [categoryName, itemMeasure], (err, result) => {
    if (err) {
      console.error('Error adding category:', err);
      return res.status(500).json({ error: 'Failed to add category' });
    }
    res.status(200).json({ message: 'Category added successfully' });
  });
};


exports.addItems = (req, res) => {
  const { itemName, itemCode } = req.body;

  const query = `
    INSERT INTO itemNames (item_name, item_code)
    VALUES (?, ?)
  `;

  db.query(query, [itemName, itemCode], (err, result) => {
    if (err) {
      console.error('Error adding category:', err);
      return res.status(500).json({ error: 'Failed to add category' });
    }
    res.status(200).json({ message: 'Category added successfully' });
  });
};



exports.uploadExcelItems = (req, res) => {
  // Construct the path to the uploaded file
  const filePath = path.join(__dirname, '../uploads', req.file.filename);

  try {
      // Read the Excel file
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      // SQL query to insert data into the database
      const query = `INSERT INTO itemNames (item_name, item_code) VALUES (?, ?)`;

      data.forEach((row) => {
          // Match the Excel column names to the database column names
          const itemName = row['Item Name'] ? row['Item Name'].trim() : null;
          const itemCode = row['Item Code'] ? row['Item Code'].trim() : null;

          // Ensure both item_name and item_code are not null or empty
          if (itemName && itemCode) {
              db.query(query, [itemName, itemCode], (err) => {
                  if (err) {
                      console.error('Error adding item from Excel:', err);
                  }
              });
          } else {
              console.error('Skipping row due to missing item name or code:', row);
          }
      });

      // Delete the uploaded file after processing
      fs.unlinkSync(filePath);

      res.status(200).json({ message: 'Items added successfully from Excel file' });
  } catch (err) {
      console.error('An error occurred while uploading the Excel file:', err);
      res.status(500).json({ message: 'An error occurred while uploading the Excel file' });
  }
};

// For Category
exports.uploadCategoryExcel = (req, res) => {
  // Construct the path to the uploaded file
  const filePath = path.join(__dirname, '../uploads', req.file.filename);

  try {
      // Read the Excel file
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      // SQL query to insert data into the database
      const query = `INSERT INTO categories (category_name, item_measure) VALUES (?, ?)`;

      data.forEach((row) => {
          // Match the Excel column names to the database column names
          const categoryName = row['Category Name'] ? row['Category Name'].trim() : null;
          const itemMeasure = row['Item Measure'] ? row['Item Measure'].trim() : null;

          // Ensure both item_name and item_code are not null or empty
          if (categoryName && itemMeasure) {
              db.query(query, [categoryName, itemMeasure], (err) => {
                  if (err) {
                      console.error('Error adding item from Excel:', err);
                  }
              });
          } else {
              console.error('Skipping row due to missing item name or code:', row);
          }
      });

      // Delete the uploaded file after processing
      fs.unlinkSync(filePath);

      res.status(200).json({ message: 'Items added successfully from Excel file' });
  } catch (err) {
      console.error('An error occurred while uploading the Excel file:', err);
      res.status(500).json({ message: 'An error occurred while uploading the Excel file' });
  }
};


exports.getEmployees = (req, res) => {
  const query = 'SELECT * FROM employees';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching employees:', err);
      return res.status(500).send('Server error');
    }
    res.json(results);
  });
};


exports.addUserRole = (req, res) => {
  const { employeeId, username, password, role } = req.body;

  // Fetch the employee by ID to get first and last name
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

    // Insert the user role into the users table
    const insertUserQuery = `
      INSERT INTO users (fname, lname, username, password, role)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(insertUserQuery, [first_name, last_name, username, password, role], (err, result) => {
      if (err) {
        console.error('Error adding user role:', err);
        return res.status(500).send('Server error');
      }
      res.status(200).send('User role added successfully');
    });
  });
};

exports.updateOutOfStock = (req, res) => {
  const { id } = req.params; // Ensure you're extracting 'id' not 'paymentId'
  console.log('Attempting to update outofstock for paymentId:', id);

  const query = 'UPDATE payments SET outofstock = ? WHERE id = ?';
  db.query(query, ['yes', id], (err, result) => {
    if (err) {
      console.error('Error updating outofstock:', err);
      return res.status(500).send('Server error');
    }

    if (result.affectedRows === 0) {
      console.log('No payment found with the given ID:', id);
      return res.status(404).send('Payment not found');
    }

    res.json({ message: 'Out of stock updated successfully' });
  });
};

// Single Date Report
exports.sellingReportPerDay = (req, res) => {
  const { date } = req.query;

  if (!date) {
      return res.status(400).json({ error: 'Date is required' });
  }

  const query = `
      SELECT
          p.categorie,
          p.item_measure, 
          p.name, 
          p.created_at, 
          p.quantity, 
          p.item_measure,
          p.unitPrice, 
          p.total, 
          c.name as customerName, 
          c.address as address,
          c.tel as phoneNumber,
          d.price as purchasePrice, 
          (p.total - d.price * p.quantity) as profit
      FROM 
          payments p
      JOIN 
          customers c ON p.customerId = c.id
      JOIN 
          drugs d ON p.drugId = d.id
      WHERE 
          DATE(p.created_at) = ?`;

  db.query(query, [date], (err, results) => {
      if (err) {
          console.error('Error fetching payments:', err);
          return res.status(500).json({ error: 'Failed to fetch payments' });
      }
      res.status(200).json(results);
  });
};

// Date Range Report
exports.sellingReportPerDayWithRange = (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Both startDate and endDate are required' });
  }

  const query = `
      SELECT 
          p.name,
          p.categorie,
          p.item_measure, 
          p.created_at, 
          p.quantity,
          p.item_measure, 
          p.unitPrice, 
          p.total, 
          c.name as customerName,
          c.address as address,
          c.tel as phoneNumber, 
          d.price as purchasePrice, 
          (p.total - d.price * p.quantity) as profit
      FROM 
          payments p
      JOIN 
          customers c ON p.customerId = c.id
      JOIN 
          drugs d ON p.drugId = d.id
      WHERE 
          DATE(p.created_at) BETWEEN ? AND ?`;

  db.query(query, [startDate, endDate], (err, results) => {
      if (err) {
          console.error('Error fetching payments:', err);
          return res.status(500).json({ error: 'Failed to fetch payments' });
      }
      res.status(200).json(results);
  });
};

exports.getDrugsByCategory = (req, res) => {
  const query = `
    SELECT categorie, code, name, batchNo, item_measure, quantity, price, sell, expiry 
    FROM drugs 
    ORDER BY categorie;
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch drugs by category' });
    }
    res.status(200).json(results);
  });
};

exports.saveSettings = (req, res) => {
  const { phoneNumber, tinNumber, licenseNumber, email, titleAmharic, titleEnglish } = req.body;

  const query = `
    INSERT INTO settings (phoneNumber, tinNumber, licenseNumber, email, titleAmharic, titleEnglish)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [phoneNumber, tinNumber, licenseNumber, email, titleAmharic, titleEnglish], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to save settings' });
    }
    res.status(200).json({ message: 'Settings saved successfully', settingsId: result.insertId });
  });
};
// settingsController.js
exports.getSettings = (req, res) => {
  const query = `SELECT * FROM settings WHERE id = 1`;

  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }

    res.status(200).json(result[0]);
  });
};

// settingsController.js
exports.updateSettings = (req, res) => {
  const {
    phoneNumber,
    tinNumber,
    licenseNumber,
    email,
    titleAmharic,
    titleEnglish,
  } = req.body;

  const query = `
    UPDATE settings
    SET phoneNumber = ?, tinNumber = ?, licenseNumber = ?, email = ?, titleAmharic = ?, titleEnglish = ?
    WHERE id = 1
  `;

  db.query(
    query,
    [phoneNumber, tinNumber, licenseNumber, email, titleAmharic, titleEnglish],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to update settings' });
      }

      res.status(200).json({ message: 'Settings updated successfully' });
    }
  );
};

