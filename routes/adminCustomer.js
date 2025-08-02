const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// GET all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find({}).select('-password');
    res.json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ message: 'Error fetching customers' });
  }
});

// GET customer count
router.get('/count', async (req, res) => {
  try {
    const count = await Customer.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error('Error fetching customer count:', err);
    res.status(500).json({ message: 'Failed to fetch customer count' });
  }
});

// GET a single customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select('-password');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    console.error('Error fetching customer:', err);
    res.status(500).json({ message: 'Error fetching customer' });
  }
});

// UPDATE a customer by ID
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Loop through the keys in the request body and update the customer document.
    // This will trigger virtual setters if they exist (like for 'name') and
    // also trigger the pre-save hook for password hashing.
    for (const key in req.body) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        // Avoid updating the _id field
        if (key === '_id') continue;
        customer[key] = req.body[key];
      }
    }

    const updatedCustomer = await customer.save();

    // Exclude password from the response
    const customerObj = updatedCustomer.toObject();
    delete customerObj.password;

    res.json(customerObj);
  } catch (err) {
    console.error('Error updating customer:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Error updating customer' });
  }
});

// DELETE a customer by ID
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting customer' });
  }
});

module.exports = router;