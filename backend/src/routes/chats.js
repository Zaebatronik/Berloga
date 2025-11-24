const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');

// Получить все чаты пользователя
router.get('/user/:userId', async (req, res) => {
  try {
    const chats = await Chat.find({
      'participants.userId': req.params.userId,
    }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

// Получить чат по объявлению (для покупателя и продавца)
router.get('/listing/:listingId/user/:userId', async (req, res) => {
  try {
    const { listingId, userId } = req.params;
    console.log('🔍 Поиск чата:', { listingId, userId });
    
    // Ищем чат где есть это объявление и пользователь является участником
    const chat = await Chat.findOne({
      listingId,
      'participants.userId': userId
    });

    if (!chat) {
      console.log('❌ Чат не найден для:', { listingId, userId });
      return res.status(404).json({ message: 'Чат не найден' });
    }

    console.log(`✅ Чат найден: ${chat._id}, сообщений: ${chat.messages.length}`);
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

// Получить конкретный чат
router.get('/:id', async (req, res) => {
  try {
    console.log('🔍 Получение чата по ID:', req.params.id);
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      console.log('❌ Чат не найден:', req.params.id);
      return res.status(404).json({ message: 'Чат не найден' });
    }
    console.log(`✅ Чат найден: ${chat._id}, сообщений: ${chat.messages.length}, участников: ${chat.participants.length}`);
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

// Создать чат
router.post('/', async (req, res) => {
  try {
    const { listingId, participants } = req.body;
    
    // Проверка, существует ли уже чат
    const existingChat = await Chat.findOne({
      listingId,
      'participants.userId': { $all: participants.map(p => p.userId) },
    });

    if (existingChat) {
      return res.json(existingChat);
    }

    const chat = new Chat({
      listingId,
      participants,
      messages: [],
    });

    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

// Отправить сообщение
router.post('/:id/messages', async (req, res) => {
  try {
    console.log('📨 Получен запрос на отправку сообщения:', {
      chatId: req.params.id,
      message: req.body
    });

    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      console.log('❌ Чат не найден:', req.params.id);
      return res.status(404).json({ message: 'Чат не найден' });
    }

    console.log('✅ Чат найден, добавляю сообщение. Участники:', chat.participants);
    chat.messages.push(req.body);
    await chat.save();
    
    console.log(`✅ Сообщение сохранено. Всего сообщений в чате: ${chat.messages.length}`);
    res.status(201).json(chat);
  } catch (error) {
    console.error('❌ Ошибка отправки сообщения:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

// Поделиться контактами
router.post('/:id/share-contacts', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }

    const participant = chat.participants.find(
      p => p.userId.toString() === req.body.userId
    );

    if (participant) {
      participant.contactsShared = true;
      participant.contacts = req.body.contacts;
      await chat.save();
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

module.exports = router;
