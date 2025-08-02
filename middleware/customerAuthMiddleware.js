const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  console.log('Authorization Header:', req.headers.authorization);
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debug log
    if (decoded.role !== 'customer') {
      console.log('Role check failed:', decoded.role);
      return res.status(403).json({ message: 'Customers only' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Token verification error:', err.message);
    return res.status(403).json({ message: 'Invalid token' });
  }
};
