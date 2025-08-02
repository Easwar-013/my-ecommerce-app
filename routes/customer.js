const express = require('express');
const bcrypt = require('bcrypt');
const Customer = require('../models/customer');
const router = express.Router();
const customerAuthMiddleware = require('../middleware/customerAuthMiddleware');
const customerController = require('../controllers/customerController');

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await Customer.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = new Customer({ name, email, password: hashedPassword });
    await customer.save();
    res.status(201).json({ message: 'Customer registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    res.status(200).json({ message: 'Login successful', user: customer.name });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', customerAuthMiddleware, customerController.updateProfile);

// Change password
router.put('/change-password', customerAuthMiddleware, customerController.changePassword);

module.exports = router;
