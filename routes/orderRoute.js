// routes/orderRoute.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const customerAuthMiddleware = require('../middleware/customerAuthMiddleware');

router.post('/orders', customerAuthMiddleware, orderController.placeOrder);

module.exports = router;
