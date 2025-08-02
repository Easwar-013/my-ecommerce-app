const Customer = require('../models/customer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.updateProfile = async (req, res) => {
  try {
    const { firstname, lastname } = req.body;
    const customerId = req.user.id;

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    customer.firstname = firstname || customer.firstname;
    customer.lastname = lastname || customer.lastname;

    await customer.save();

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const customerId = req.user.id;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirm password do not match' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const isMatch = await bcrypt.compare(currentPassword, customer.password);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    customer.password = hashedPassword;

    await customer.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
