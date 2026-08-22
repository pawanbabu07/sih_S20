/**
 * Middleware to restrict access to users with 'admin' role.
 * Assumes authMiddleware (protect) has already run and populated req.user.
 */
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
};

module.exports = adminMiddleware;
