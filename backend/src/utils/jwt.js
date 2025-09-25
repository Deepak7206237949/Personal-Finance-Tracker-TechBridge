const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const ms = require('ms');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_DAYS = parseInt(process.env.JWT_REFRESH_DAYS || '7', 10);

function signAccessToken(user) {
  return jwt.sign({ id: user.id, role: user.role, email: user.email }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function signRefreshToken(user) {
  // token string
  const token = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: `${REFRESH_DAYS}d` });
  // store it to DB with expiration date
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
  return { token, expiresAt };
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken };
