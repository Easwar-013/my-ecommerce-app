// routes/adminOrder.js
const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');

// Get all orders (for admin)
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('productId').populate('userId');
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      productName: order.productId?.name || 'Unknown',
      price: order.productId?.price || 0,
      customerName: order.userId?.name || 'Unknown',
      createdAt: order.createdAt,
    }));
    res.json(formattedOrders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Cancel an order
router.delete('/orders/:id', async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel order' });
  }
});

module.exports = router;
