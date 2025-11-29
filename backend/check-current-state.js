// Скрипт для очистки фейковых пользователей и их объявлений
const https = require('https');

console.log('🔍 Проверяем текущих пользователей и объявления...\n');

// Сначала получаем все объявления
https.get('https://kupiyproday.onrender.com/listings', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      const listings = JSON.parse(data);
      console.log(`✅ Всего объявлений в базе: ${listings.length}\n`);
      
      // Группируем по пользователям
      const byUser = {};
      listings.forEach(l => {
        const userId = l.userId;
        if (!byUser[userId]) {
          byUser[userId] = {
            nickname: l.userNickname || 'Unknown',
            count: 0,
            listings: []
          };
        }
        byUser[userId].count++;
        byUser[userId].listings.push(l.title);
      });
      
      console.log('📊 ОБЪЯВЛЕНИЯ ПО ПОЛЬЗОВАТЕЛЯМ:\n');
      Object.entries(byUser).forEach(([userId, data]) => {
        console.log(`User ID: ${userId}`);
        console.log(`  Nickname: ${data.nickname}`);
        console.log(`  Объявлений: ${data.count}`);
        data.listings.forEach((title, i) => {
          console.log(`    ${i+1}. ${title}`);
        });
        console.log('');
      });
      
      console.log('\n🎯 РЕКОМЕНДАЦИЯ:');
      console.log('Зайди в админ панель (когда она загрузится) и проверь:');
      console.log('1. Какие пользователи есть в базе users');
      console.log('2. Сравни с userId из объявлений выше');
      console.log('3. Если userId из объявлений нет в users - это фейк!');
      console.log('4. Удали фейковых пользователей через админку');
      
    } else {
      console.log('❌ Ошибка:', res.statusCode);
    }
  });
}).on('error', (e) => {
  console.error('❌ Ошибка:', e.message);
});
