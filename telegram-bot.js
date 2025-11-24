// Простой Telegram бот для открытия Mini App
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Создайте бота с токеном от BotFather
const token = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const webAppUrl = 'https://kupyprodai.pages.dev';

const bot = new TelegramBot(token, { polling: true });

// Устанавливаем Menu Button для всех пользователей (кнопка в поле ввода)
bot.setChatMenuButton({
  menu_button: {
    type: 'web_app',
    text: '🛍️ Открыть Берлогу',
    web_app: { url: webAppUrl }
  }
}).then(() => {
  console.log('✅ Menu Button установлена!');
}).catch(err => {
  console.error('❌ Ошибка установки Menu Button:', err.message);
});

// Приветственные сообщения на трёх языках
const welcomeMessages = {
  ru: '🐻 Добро пожаловать в Берлогу!\n\n' +
      '🛍️ Маркетплейс вашего района\n' +
      '📍 Покупайте и продавайте товары рядом с вами\n\n' +
      '👇 Нажмите кнопку ниже:',
  en: '🐻 Welcome to Berloga!\n\n' +
      '🛍️ Local marketplace\n' +
      '📍 Buy and sell items near you\n\n' +
      '👇 Press the button below:',
  de: '🐻 Willkommen bei Berloga!\n\n' +
      '🛍️ Lokaler Marktplatz\n' +
      '📍 Kaufen und verkaufen Sie in Ihrer Nähe\n\n' +
      '👇 Drücken Sie die Taste unten:'
};

// Текст кнопки на трёх языках
const buttonText = '🛍️ Магазин | Shop | Geschäft';

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Логируем ID пользователя
  console.log(`👤 User started bot: ID=${userId}, Username=@${msg.from.username || 'no username'}, Name=${msg.from.first_name}`);
  
  // Приветствие на всех трёх языках
  const message = 
    '🐻 Добро пожаловать в Берлогу!\n' +
    '🐻 Welcome to Berloga!\n' +
    '🐻 Willkommen bei Berloga!\n\n' +
    '🛍️ Маркетплейс вашего района | Local marketplace | Lokaler Marktplatz\n' +
    '📍 Покупайте и продавайте товары рядом с вами\n' +
    '📍 Buy and sell items near you\n' +
    '📍 Kaufen und verkaufen Sie in Ihrer Nähe\n\n' +
    '👇 Нажмите кнопку ниже | Press the button below | Drücken Sie die Taste unten:';
  
  // Отправляем приветствие с INLINE кнопкой (работает у всех)
  bot.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🛍️ Открыть Берлогу | Open Berloga', web_app: { url: webAppUrl } }]
      ]
    }
  });
  
  // Устанавливаем Menu Button для этого пользователя
  bot.setChatMenuButton({
    chat_id: chatId,
    menu_button: {
      type: 'web_app',
      text: '🛍️ Берлога',
      web_app: { url: webAppUrl }
    }
  }).catch(err => {
    // Игнорируем ошибки (например, если бот заблокирован)
    console.log(`⚠️ Не удалось установить Menu Button для ${userId}: ${err.message}`);
  });
});

// Команда /app для быстрого открытия
bot.onText(/\/app/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, '🛍️ Открыть приложение | Open App:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🛍️ Открыть Берлогу', web_app: { url: webAppUrl } }]
      ]
    }
  });
});

// Обработчик любых других сообщений
bot.on('message', (msg) => {
  if (msg.text && !msg.text.startsWith('/')) {
    const chatId = msg.chat.id;
    const languageCode = msg.from.language_code || 'en';
    
    let message = '👉 Use the button below to open the app';
    if (languageCode.startsWith('ru')) {
      message = '👉 Используйте кнопку ниже для работы с приложением';
    } else if (languageCode.startsWith('de')) {
      message = '👉 Verwenden Sie die Schaltfläche unten, um die App zu öffnen';
    }
    
    bot.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🛍️ Открыть Берлогу | Open App', web_app: { url: webAppUrl } }]
        ]
      }
    });
  }
});

console.log('🤖 Бот запущен!');
