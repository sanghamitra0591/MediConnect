const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Admin = require('../models/Admin');

const auth = (role = 'doctor') => async (req, res, next) => {
  console.log(`Auth middleware called for route: ${req.method} ${req.originalUrl}`);
  console.log(`Required role: ${role}`);
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No token provided in request');
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', {decoded});
    
    if (decoded.userType === 'doctor') {
      req.user = await Doctor.findById(decoded.id).select('-password');
      console.log('Doctor found:', req.user ? req.user._id : 'Not found');
    } else if (decoded.userType === 'admin') {
      req.user = await Admin.findById(decoded.id).select('-password');
      console.log('Admin found:', req.user ? req.user._id : 'Not found');
    }
    
    if (!req.user) {
      console.log('User not found with decoded ID');
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Check if user has required role
    if (role && decoded.userType !== role) {
      console.log(`Role mismatch: Required ${role}, got ${decoded.userType}`);
      return res.status(403).json({ error: 'Not authorized for this action' });
    }
    
    console.log('Auth successful, proceeding to route handler');
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = auth;
