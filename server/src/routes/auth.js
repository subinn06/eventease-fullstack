const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient');
const { generateAccessToken, generateRefreshToken, refreshExpiresAt } = require('../utils/token');

const router = express.Router();

// register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed, role: role || 'USER' } });
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: refreshExpiresAt() }
    });

    // set HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 30)
    });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: refreshExpiresAt() }
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * (process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 30)
    });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// refresh
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    // verify signature
    const jwt = require('jsonwebtoken');
    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET); } catch (e) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // find stored token
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.revoked) return res.status(401).json({ error: 'Invalid refresh token' });
    if (new Date(stored.expiresAt) < new Date()) return res.status(401).json({ error: 'Refresh token expired' });

    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) return res.status(401).json({ error: 'User not found' });

    const accessToken = generateAccessToken(user);
    res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await prisma.refreshToken.updateMany({ where: { token }, data: { revoked: true } });
      res.clearCookie('refreshToken');
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
