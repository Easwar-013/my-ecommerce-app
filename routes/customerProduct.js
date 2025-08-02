const express = require('express');
const router = express.Router();
const customerAuth = require('../middleware/customerAuthMiddleware');
const Product = require('../models/product');

router.get('/', customerAuth, async (req, res) => {
  try {
    const { name, category, maxPrice, sortBy="createdAt", order="desc", page = 1, limit = 20 } = req.query;

    const filter = {};

// Case-insensitive name search
    if (name) {
      filter.name = { $regex: new RegExp(name, 'i') };
    }

     if (category) {
      filter.category = { $regex: new RegExp(category.trim(), 'i') };
    }

     if (maxPrice) {
      filter.price = { $lte: Number(maxPrice) };
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json({ products, total });

  } catch (error) {
    console.error("Error fetching customer products:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
