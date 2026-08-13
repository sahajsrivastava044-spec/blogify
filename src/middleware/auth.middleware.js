const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  // 1. Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. Fallback to check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 3. If no token found at all, reject
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  // 4. Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded payload to the request
    next(); // Pass control to the next middleware/controller
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

module.exports = protect;