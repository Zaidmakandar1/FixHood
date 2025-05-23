const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = verified;
    console.log('Authenticated user:', req.user);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token verification failed, authorization denied' });
  }
};

const checkRole = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No user in request' });
  }
  console.log('User role:', req.user.role);
  if (!roles.includes(req.user.role)) {
    console.log(
      `Access denied: user role "${req.user.role}" does not match required roles [${roles.join(', ')}]`
    );
    return res.status(403).json({ message: `Forbidden: requires role(s) ${roles.join(', ')}` });
  }
  next();
};

module.exports = { auth, checkRole };