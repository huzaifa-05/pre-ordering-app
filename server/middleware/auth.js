import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_pre_ordering_app_2026';

/**
 * Middleware to verify custom JWT token in Authorization: Bearer <TOKEN> header.
 * Attaches decoded user payload (id, email, full_name, role) to req.user if valid.
 */
export const verifyAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    console.warn('[AUTH MIDDLEWARE] Invalid token:', err.message);
    req.user = null;
  }

  next();
};

/**
 * Strict middleware requirement — returns 401 Unauthorized if missing/invalid token
 */
export const requireAuth = (req, res, next) => {
  verifyAuth(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Please log in to proceed' });
    }
    next();
  });
};
