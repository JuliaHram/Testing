const jwt = require('jsonwebtoken');
const { isBlacklisted } = require('../services/tokenService');

module.exports = async function (req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Нет токена' });
  }
  const token = header.split(' ')[1];
  if (await isBlacklisted(token)) {
    return res.status(401).json({ message: 'Токен отозван' });
  }
  try {
    req.teacher = jwt.verify(token, process.env.JWT_SECRET);
    req.token = token;
    next();
  } catch {
    return res.status(401).json({ message: 'Неверный токен' });
  }
};