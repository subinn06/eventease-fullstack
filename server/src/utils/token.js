const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');

function generateAccessToken(user) {
  return jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' });
}

function generateRefreshToken() {
  // just a random jwt or any random string, we'll sign with refresh secret
  return jwt.sign({ t: Date.now() }, process.env.JWT_REFRESH_SECRET, { expiresIn: `${process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 30}d` });
}

function refreshExpiresAt() {
  return dayjs().add(parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 30), 'day').toDate();
}

module.exports = { generateAccessToken, generateRefreshToken, refreshExpiresAt };
