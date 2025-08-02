// middleware/verifyAdminToken.js

const jwt = require("jsonwebtoken");

const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expecting: Bearer <token>

  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // You must set JWT_SECRET in .env
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden. Not an admin." });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = verifyAdminToken;
