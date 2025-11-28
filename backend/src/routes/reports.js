const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { verifyTelegramAuth, requireAdmin, requireRegistered } = require('../middleware/auth');

// Создать жалобу
router.post('/', verifyTelegramAuth, requireRegistered, async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();
    res.status(201).json({ message: 'Жалоба отправлена', report });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

// Получить все жалобы (для модераторов)
router.get('/', verifyTelegramAuth, requireAdmin, async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

// Обновить статус жалобы
router.patch('/:id/status', verifyTelegramAuth, requireAdmin, async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!report) {
      return res.status(404).json({ message: 'Жалоба не найдена' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

module.exports = router;
