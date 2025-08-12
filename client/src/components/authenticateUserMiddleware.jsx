const jwt = require('jsonwebtoken');
const User = require('./models/User'); // your mongoose User model

const authenticateUserMiddleware = async (req, res, next) => {
  try {
    // Get token from header or cookie, e.g. from Authorization header:
    // Bearer <token>
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // use your JWT secret here

    // Attach user id to request object
    req.user = { id: decoded.userId };

    next(); // move to next middleware or route handler
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = authenticateUserMiddleware;
