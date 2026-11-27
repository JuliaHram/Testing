const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const Submission = require('../models/Submission');
const auth = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');
const redis = require('../config/redis');
const { sendStudentThanks, sendTeacherNotification } = require('../services/mailService');

// ============================================================
// Публичный: получить тест БЕЗ правильных ответов.
// ============================================================
router.get('/test/:id', async (req, res) => {
  try {
    const cacheKey = `test:${req.params.id}`;
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Тест не найден' });

    const payload = {
      _id: test._id,
      title: test.title,
      questions: test.questions.map(q => ({
        section: q.section,
        part: q.part,
        type: q.type,
        questionText: q.questionText,
        options: q.options || [],
        hint: q.hint || '',
        points: q.points || 1,
      })),
    };

    await redis.set(cacheKey, JSON.stringify(payload), 'EX', 600);
    res.json(payload);
  } catch (err) {
    console.error('GET /test/:id:', err.message);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// ============================================================
// Публичный: принять ответы, проверить на сервере, сохранить.
// ============================================================
router.post(
  '/submit',
  rateLimit({ keyPrefix: 'rl:submit', max: 5, windowSec: 600 }),
  async (req, res) => {
    try {
      const { testId, studentName, studentEmail, answers } = req.body;

      if (!testId || !studentName || !studentEmail || !Array.isArray(answers)) {
        return res.status(400).json({ message: 'Не хватает данных' });
      }

      const test = await Test.findById(testId);
      if (!test) return res.status(404).json({ message: 'Тест не найден' });

      let score = 0;
      let autoChecked = 0;

      // ИСПРАВЛЕННЫЙ БЛОК ПРОВЕРКИ:
      test.questions.forEach((q, i) => {
        // Пропускаем эссе (writing), его проверяет препод
        if (q.type === 'writing') return;
        
        autoChecked++;

        // Приводим к нижнему регистру и убираем пробелы для надежного сравнения
        const userAns = String(answers[i] ?? '').trim().toLowerCase();
        const correct = String(q.correctAnswer ?? '').trim().toLowerCase();
        
        if (userAns && userAns === correct) {
          score += q.points || 1;
        }
      });

      const submission = await Submission.create({
        studentName,
        studentEmail,
        testId,
        answers,
        score,
        total: test.questions.length,
        autoChecked,
      });

      Promise.all([
        sendStudentThanks(studentEmail, studentName),
        sendTeacherNotification(studentName, score, autoChecked),
      ]).catch(err => console.error('mail:', err.message));

      res.json({ message: 'Спасибо! Ответы получены.' });
    } catch (err) {
      console.error('POST /submit:', err.message);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }
);

// ============================================================
// Приватный: список результатов + правильные ответы для проверки.
// ============================================================
router.get('/admin/submissions', auth, async (req, res) => {
  try {
    // populate('testId') загружает весь объект теста, включая вопросы с correctAnswer
    const list = await Submission.find()
      .populate('testId') 
      .sort({ submittedAt: -1 });
    res.json(list);
  } catch (err) {
    console.error('GET /admin/submissions:', err.message);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;