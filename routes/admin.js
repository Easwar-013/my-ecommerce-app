const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Customer = require('../models/customer');

// Seeded admin credentials
const admin = {
  username: 'admin',
  password: 'admin123'  // In real apps, use hashed passwords
};

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === admin.username && password === admin.password) {
    res.status(200).json({ message: 'Admin login successful' });
  } else {
    res.status(401).json({ message: 'Invalid admin credentials' });
  }
});

// Endpoint to get total product count
router.get('/products/count', async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error('Error fetching product count:', err);
    res.status(500).json({ message: 'Failed to fetch product count' });
  }
});

// Endpoint to get total customer count
router.get('/customers/count', async (req, res) => {
  try {
    const count = await Customer.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error('Error fetching customer count:', err);
    res.status(500).json({ message: 'Failed to fetch customer count' });
  }
});

module.exports = router;
