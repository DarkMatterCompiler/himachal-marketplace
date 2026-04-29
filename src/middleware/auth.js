// src/middleware/auth.js
import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user; // { userId, email, userType }
    next();
  });
};

// Middleware to check if user is a seller
export const requireSeller = (req, res, next) => {
  if (req.user.userType.toUpperCase() !== 'SELLER') {
    return res.status(403).json({ error: 'Access denied. Seller account required.' });
  }
  next();
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (req.user.userType.toUpperCase() !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Middleware to check if user is buyer
export const requireBuyer = (req, res, next) => {
  if (req.user.userType.toUpperCase() !== 'BUYER') {
    return res.status(403).json({ error: 'Access denied. Buyer account required.' });
  }
  next();
};
