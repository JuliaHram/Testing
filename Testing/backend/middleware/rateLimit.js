const redis = require('../config/redis');

module.exports = function rateLimit({ keyPrefix, max, windowSec }) {
  return async (req, res, next) => {
    try {
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const key = `${keyPrefix}:${ip}`;
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, windowSec);
      if (count > max) {
        return res.status(429).json({ message: 'Слишком много запросов. Попробуйте позже.' });
      }
      next();
    } catch {
      next(); // если Redis недоступен — не блокируем работу
    }
  };
};