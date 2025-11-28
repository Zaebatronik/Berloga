/**
 * Скрипт для удаления ВСЕХ пользователей из MongoDB
 * ВНИМАНИЕ: Это действие необратимо!
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function clearAllUsers() {
  try {
    console.log('🔌 Подключение к MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Подключено к MongoDB');

    // Получаем количество пользователей
    const count = await User.countDocuments();
    console.log(`📊 Найдено пользователей: ${count}`);

    if (count === 0) {
      console.log('ℹ️ База уже пуста');
      process.exit(0);
    }

    // Показываем список пользователей перед удалением
    const users = await User.find();
    console.log('\n📋 Список пользователей для удаления:');
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.nickname} (Telegram ID: ${u.telegramId}, Город: ${u.city})`);
    });

    // Удаляем всех пользователей
    console.log(`\n🗑️ Удаление ${count} пользователей...`);
    const result = await User.deleteMany({});
    
    console.log(`✅ Удалено пользователей: ${result.deletedCount}`);
    console.log('🎉 База данных очищена!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

clearAllUsers();
