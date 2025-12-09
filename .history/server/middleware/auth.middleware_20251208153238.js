const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token and attach user info to request
 */
const verifyToken = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    // BYPASS AUTHENTICATION FOR DEMO/DEV PURPOSES
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Inject a default admin user
      req.user = {
        userId: 1, // Assuming ID 1 exists or is safe to use
        role: 'ADMIN',
        email: 'admin@preppioneer.com'
      };
      return next();
    }

    // Get the token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Token verification failed
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Token expired' 
      });
    }

    return res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Token verification failed' 
    });
  }
};

/**
 * Middleware to authorize specific roles
 * @param {Array<string>} allowedRoles - Array of roles that are allowed to access the route
 * @returns {Function} Express middleware function
 * 
 * Usage: authorizeRole(['ADMIN', 'INSTRUCTOR'])
 */
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Ensure verifyToken has already been called
      if (!req.user || !req.user.role) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'User authentication required' 
        });
      }

      // Check if user's role is in the allowed roles array
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}` 
        });
      }

      // User has required role, proceed to next middleware/route
      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      return res.status(500).json({ 
        error: 'Server Error', 
        message: 'Error checking user authorization' 
      });
    }
  };
};

module.exports = { verifyToken, authorizeRole };
