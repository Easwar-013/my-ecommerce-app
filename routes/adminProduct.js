// routes/adminProduct.js
const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const upload = require('../upload'); // Your multer config
const verifyAdminToken = require('../middleware/verifyAdminToken'); 
const productController = require('../controllers/productController');

// Create a product with image
router.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body; // ✅ include stock

    const imagePath = req.file ? req.file.filename : null;

    const product = new Product({
      name,
      description,
      price:Number(price),
      category,
      stock:Number(stock), // ✅ add stock here
      image: imagePath
    });

    await product.save();

    res.status(201).json({ message: '✅ Product created', product });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: '❌ Error creating product' });
  }
});

// DELETE a product by ID
router.delete('/products/:id', verifyAdminToken, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "✅ Product deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "❌ Error deleting product" });
  }
});

router.get('/products/count', async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error('Error fetching product count:', err);
    res.status(500).json({ message: 'Failed to fetch product count' });
  }
});


// Get all products
// Get all products or filter by name
router.get('/products', async (req, res) => {
  try {
    const query = {};

    // Support filtering by name (case-insensitive)
    if (req.query.name) {
      query.name = { $regex: req.query.name, $options: 'i' };
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Failed to fetch products' });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err.message);
    res.status(500).json({ message: 'Error fetching product' });
  }
});
router.put('/products/:id', verifyAdminToken, upload.single('image'), productController.updateProduct);


module.exports = router;
