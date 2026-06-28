/**
 * Middleware: Check if user has admin role
 * Must be used AFTER verifyToken middleware
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden: Admin access required' });
};

module.exports = isAdmin;
