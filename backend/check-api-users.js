// Быстрый скрипт для проверки пользователей через API
const https = require('https');

const ADMIN_ID = '670170626';
const BOT_TOKEN = '7939786678:AAHSujmve3UREb9YLpZZWY2fiA00qUj0Fz8';

// Создаём фейковый initData для админа
const crypto = require('crypto');
const initDataParams = new URLSearchParams({
  user: JSON.stringify({ id: parseInt(ADMIN_ID), username: 'admin' }),
  auth_date: Math.floor(Date.now() / 1000).toString(),
});

// Считаем hash
const dataCheckString = Array.from(initDataParams.entries())
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
initDataParams.set('hash', hash);

const initData = initDataParams.toString();

console.log('🔍 Проверяем пользователей в базе через API...\n');

const options = {
  hostname: 'kupiyproday.onrender.com',
  path: '/users',
  method: 'GET',
  headers: {
    'x-telegram-init-data': initData,
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    
    if (res.statusCode === 200) {
      const users = JSON.parse(data);
      console.log(`\n✅ ВСЕГО ПОЛЬЗОВАТЕЛЕЙ: ${users.length}\n`);
      
      users.forEach((u, i) => {
        console.log(`${i+1}. Telegram ID: ${u.telegramId}`);
        console.log(`   Nickname: ${u.nickname}`);
        console.log(`   City: ${u.city}`);
        console.log(`   Banned: ${u.banned ? '🚫 ДА' : '✅ НЕТ'}`);
        console.log('');
      });
      
      // Ищем Natali
      const natali = users.find(u => u.nickname && u.nickname.toLowerCase().includes('natali'));
      if (natali) {
        console.log('🔍 НАЙДЕНА NATALI:');
        console.log('   Telegram ID:', natali.telegramId);
        console.log('   Nickname:', natali.nickname);
        console.log('   Banned:', natali.banned);
        console.log('   City:', natali.city);
      } else {
        console.log('❌ Natali НЕ НАЙДЕНА в базе пользователей');
      }
    } else {
      console.log('❌ Ошибка:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.end();
