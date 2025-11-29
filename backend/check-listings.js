// Проверка объявлений через публичный API
const https = require('https');

console.log('🔍 Проверяем объявления в базе (публичный endpoint)...\n');

const req = https.get('https://kupiyproday.onrender.com/listings', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    
    if (res.statusCode === 200) {
      const listings = JSON.parse(data);
      console.log(`\n✅ ВСЕГО ОБЪЯВЛЕНИЙ: ${listings.length}\n`);
      
      // Группируем по userNickname
      const byUser = {};
      listings.forEach(l => {
        const nick = l.userNickname || 'UNKNOWN';
        if (!byUser[nick]) {
          byUser[nick] = [];
        }
        byUser[nick].push(l);
      });
      
      console.log('📊 ОБЪЯВЛЕНИЯ ПО ПОЛЬЗОВАТЕЛЯМ:\n');
      Object.entries(byUser).forEach(([nickname, items]) => {
        console.log(`${nickname}: ${items.length} объявлений`);
        console.log(`   User ID: ${items[0].userId}`);
        items.forEach((l, i) => {
          console.log(`   ${i+1}. ${l.title} (${l.status})`);
        });
        console.log('');
      });
      
      // Ищем Natali
      const nataliListings = listings.filter(l => 
        l.userNickname && l.userNickname.toLowerCase().includes('natali')
      );
      
      if (nataliListings.length > 0) {
        console.log('🔍 НАЙДЕНЫ ОБЪЯВЛЕНИЯ NATALI:');
        console.log(`   Всего: ${nataliListings.length}`);
        console.log(`   User ID: ${nataliListings[0].userId}`);
        nataliListings.forEach((l, i) => {
          console.log(`   ${i+1}. ${l.title}`);
        });
      } else {
        console.log('❌ Объявления Natali НЕ НАЙДЕНЫ');
      }
    } else {
      console.log('❌ Ошибка:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});
