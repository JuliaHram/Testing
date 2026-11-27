const jwt = require('jsonwebtoken');
const redis = require('../config/redis');

exports.signAccess = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });

exports.signRefresh = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

exports.verifyRefresh = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);

// Blacklist access-токена на 15 минут (равно времени его жизни)
exports.blacklistToken = async (token, ttlSec = 900) => {
  await redis.set(`bl:${token}`, '1', 'EX', ttlSec);
};

exports.isBlacklisted = async (token) => {
  const v = await redis.get(`bl:${token}`);
  return Boolean(v);
};