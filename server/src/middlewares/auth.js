const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

function authMiddleware(requiredRole) {
  return async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Missing token' });
    const parts = authHeader.trim().split(/\s+/);
    const token = parts.length === 1 ? parts[0] : parts[1];
    if (!token) return res.status(401).json({ error: 'Invalid token' });

    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) return res.status(401).json({ error: 'User not found' });
      if (requiredRole && user.role !== requiredRole && user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Token invalid or expired' });
    }
  };
}

module.exports = authMiddleware;
