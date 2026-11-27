const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Teacher = require('../models/Teacher');
const {
  signAccess, signRefresh, verifyRefresh, blacklistToken
} = require('../services/tokenService');
const auth = require('../middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(401).json({ message: 'Неверные данные' });

    const ok = await bcrypt.compare(password, teacher.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Неверные данные' });

    const payload = { id: teacher._id, email: teacher.email };
    res.json({
      accessToken: signAccess(payload),
      refreshToken: signRefresh(payload),
      teacher: { email: teacher.email }
    });
  } catch {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;
    const decoded = verifyRefresh(refreshToken);
    const payload = { id: decoded.id, email: decoded.email };
    res.json({ accessToken: signAccess(payload) });
  } catch {
    res.status(401).json({ message: 'Refresh невалиден' });
  }
});

router.post('/logout', auth, async (req, res) => {
  await blacklistToken(req.token);
  res.json({ message: 'Выход выполнен' });
});

module.exports = router;