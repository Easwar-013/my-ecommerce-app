const jwt = require('jsonwebtoken');
const Customer = require('../models/customer'); // Your customer model
const bcrypt = require('bcryptjs'); // Assuming you hash passwords

// Seeded admin credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  // Admin login
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }

  // Customer login
  try {
    const customer = await Customer.findOne({ email: username }); // or `username` if field is named differently
    if (!customer) {
      return res.status(401).json({ message: 'Customer not found' });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: customer._id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, customer });
  } catch (err) {
    console.error('Customer login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
