// models/order.js

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number
});

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  items: [orderItemSchema],
  totalAmount: Number,
  createdAt: { type: Date, default: Date.now }
});

// ✅ Prevent OverwriteModelError
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = Order;
