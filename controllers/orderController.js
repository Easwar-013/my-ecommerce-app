const Order = require('../models/order');
const Product = require('../models/product'); // ✅ this fixes the 'Product is not defined' error

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id; // assuming token middleware adds req.user

    // Validate products and calculate total price
    let totalPrice = 0;
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.productId}` });
      }
      totalPrice += product.price * item.quantity;
    }

    const newOrder = new Order({
      user: userId,
      products,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });

    await newOrder.save();
    res.status(201).json({ message: 'Order created successfully', order: newOrder });

  } catch (err) {
    console.error('Error creating order:', err.message);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const { products, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id; // token middleware sets this

    // Validate products and calculate total price
    let totalPrice = 0;
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.productId}` });
      }
      totalPrice += product.price * item.quantity;
    }

    const newOrder = new Order({
      user: userId,
      products,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });

    await newOrder.save();
    res.status(201).json({ message: 'Order placed successfully', order: newOrder });

  } catch (err) {
    console.error('Error placing order:', err.message);
    res.status(500).json({ error: 'Failed to place order' });
  }
};



