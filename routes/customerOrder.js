const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const Product = require('../models/product');
const customerAuth = require('../middleware/customerAuthMiddleware');
const orderRoutes = require('./orderRoute');

router.use('/customer', orderRoutes);

/**
 * GET all orders for logged-in customer
 * Fetch all order documents for the customer
 */
router.get('/orders', customerAuth, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id }).populate('product');
    res.json({ orders });
  } catch (err) {
    console.error("Error fetching orders:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST new order
 * Creates multiple order documents, one per item, as per orderModel.js schema.
 */
router.post('/orders', customerAuth, async (req, res) => {
  try {
    console.log('User ID:', req.user.id);
    console.log('Request body:', req.body);

    const { items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    const ordersToCreate = [];

    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({ message: "Product ID missing in one of the items" });
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return res.status(400).json({ message: `Invalid quantity for product ID ${item.productId}` });
      }
      let product;
      try {
        product = await Product.findById(item.productId);
      } catch (fetchErr) {
        console.error(`Error fetching product ${item.productId}:`, fetchErr);
        return res.status(500).json({ message: `Error fetching product ${item.productId}` });
      }
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }
      if (typeof product.price !== 'number' || product.price < 0) {
        return res.status(400).json({ message: `Invalid price for product ID ${item.productId}` });
      }

      ordersToCreate.push({
        product: item.productId,
        customer: req.user.id,
        quantity: item.quantity,
        totalPrice: product.price * item.quantity,
      });
    }

    // Create all orders in bulk
    const createdOrders = await Order.insertMany(ordersToCreate);

    res.status(201).json({ message: "Order(s) placed successfully", orders: createdOrders });
  } catch (err) {
    // Improved error logging
    console.error("Error creating orders:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
    res.status(500).json({ message: err.message || "Internal server error" });
  }
});

/**
 * DELETE an order by ID
 * Since each order document represents a single product order,
 * deleting an order means deleting the order document itself.
 */
router.delete('/orders/:orderId', customerAuth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, customer: req.user.id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Order.deleteOne({ _id: orderId });

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

