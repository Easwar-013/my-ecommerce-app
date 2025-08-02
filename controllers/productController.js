const Product = require('../models/product');

// Get all products with filters, sorting, and pagination
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      name,
      sort // Optional: e.g., 'price_asc' or 'price_desc'
    } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    let sortOption = {};
    if (sort === "price_asc") {
      sortOption.price = 1;
    } else if (sort === "price_desc") {
      sortOption.price = -1;
    }

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error in getAllProducts:", err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};


// Get single product by ID
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { name, price, category, description, stock } = req.body;
    const image = req.file ? req.file.filename : null;

    const product = new Product({
      name,
      price,
      category,
      description,
      stock,
      image
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update existing product by ID
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, category, description, stock } = req.body;
    const updateData = {
      name,
      price,
      category,
      description,
      stock
    };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updated) return res.status(404).json({ message: 'Product not found' });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
