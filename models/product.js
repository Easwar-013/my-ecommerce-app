const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String },
  description: { type: String },
  stock: { type: Number, required: true },
  image: { type: String }, // ✅ New field to store image URL/path
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
