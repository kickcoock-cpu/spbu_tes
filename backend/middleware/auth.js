const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
require('dotenv').config();

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user with role information
      req.user = await User.findByPk(decoded.id, {
        include: [
          { model: Role, attributes: ['name'] }
        ],
        attributes: { exclude: ['password'] }
      });
      
      console.log('=== AUTHENTICATION DEBUG ===');
      console.log('Decoded token ID:', decoded.id);
      console.log('User found:', req.user ? {
        id: req.user.id,
        name: req.user.name,
        spbu_id: req.user.spbu_id,
        role: req.user.Role ? req.user.Role.name : 'No role'
      } : 'No user found');
      console.log('=== END AUTHENTICATION DEBUG ===');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...permittedRoles) => {
  return (req, res, next) => {
    // Check if user has a role
    if (!req.user || !req.user.Role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User role not found.'
      });
    }
    
    console.log('=== AUTHORIZATION DEBUG ===');
    console.log('User role:', req.user.Role.name);
    console.log('Permitted roles:', permittedRoles);
    console.log('Role check result:', permittedRoles.includes(req.user.Role.name));
    console.log('=== END AUTHORIZATION DEBUG ===');
    
    // If user role is not in permitted roles, deny access
    if (!permittedRoles.includes(req.user.Role.name)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    
    next();
  };
};

module.exports = { protect, authorize };