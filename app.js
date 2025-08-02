require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminProductRoutes = require("./routes/adminProduct");
const adminCustomerRoutes = require("./routes/adminCustomer");
const adminOrderRoutes = require('./routes/adminOrder');

console.log("Loading adminCustomerRoutes...");
const Product = require("./models/product");
const Customer = require('./models/Customer'); // This is used later, so keep it.
const app = express();
const customerOrderRoutes = require('./routes/customerOrder');

// Middleware
app.use(express.json({ limit: '10mb' })); // Allow large base64
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/admin", adminProductRoutes);
app.use("/api/admin/customers", adminCustomerRoutes);
// app.use('/api', adminProductRoutes);
app.use('/api/customer', customerOrderRoutes); // customerOrderRoutes handles /orders
app.use('/api/customer/products', require('./routes/customerProduct'));
app.use('/api/admin', adminOrderRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Admin credentials
const admin = {
  username: 'admin',
  password: 'admin123'
};

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === admin.username && password === admin.password) {
    const token = jwt.sign({ role: 'admin', username }, process.env.JWT_SECRET, { expiresIn: '2h' });
    return res.json({ message: '✅ Admin login successful', token });
  }
  res.status(401).json({ message: '❌ Invalid admin credentials' });
});

// Admin Protected Route
app.get('/admin/dashboard', verifyAdminToken, (req, res) => {
  res.send(`👋 Welcome Admin: ${req.user.username}`);
});

function verifyAdminToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err || user.role !== 'admin') return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Customer HTML pages
app.get('/customer/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/customer/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/customer/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Customer Registration
app.post('/api/customer/register', async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  try {
    const exists = await Customer.findOne({ email });
    if (exists) return res.status(409).send('⚠️ Email already registered');

    // The password will be hashed by the pre-save hook in the Customer model
    const customer = new Customer({ firstname, lastname, email, password });
    await customer.save();
    res.send('✅ Registration successful');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Error registering customer');
  }
});

// Customer Login
app.post('/api/customer/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(404).json({ message: '❌ Customer not found' });

    const match = await customer.comparePassword(password);
    if (!match) return res.status(401).json({ message: '❌ Incorrect password' });

    const token = jwt.sign({ id: customer._id, email: customer.email, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.json({
      message: `✅ Welcome back, ${customer.firstname}`,
      token,
      customer: {
        id: customer._id,
        firstname: customer.firstname,
        lastname: customer.lastname,
        email: customer.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Login error' });
  }
});

// Customer Profile
app.get('/api/customer/profile', verifyCustomerToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select('-password');
    if (!customer) return res.status(404).json({ message: 'Not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

function verifyCustomerToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
