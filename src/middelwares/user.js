const jwt = require('jsonwebtoken');
const { responseHandler } = require(`${__utils}/responseHandler`);

// Add this new middleware for JWT authentication
exports.authJWT = async (req, res, next) => {
  const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1]; // Check cookies or Bearer token
  
  if (!token) {
    return responseHandler.unauthorized(res, "Token missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to request
    next();
  } catch (err) {
    responseHandler.unauthorized(res, "Invalid/Expired token");
  }
};

exports.isAdmin = (req, res, next) => {
    if (req?.user?.role == 'Admin') {
        return next(); // User is an admin, proceed to the next middleware
    }
    return responseHandler.validationError(res, "Access denied, admin privileges required.");
};