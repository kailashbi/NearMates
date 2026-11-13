export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      statusCode: 403,
      error: 'Forbidden',
      message: 'Administrative privileges required to access this resource.'
    });
  }
  next();
}

