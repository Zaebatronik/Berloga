// Проверка разных вариантов написания Natali
const https = require('https');

const variants = [
  'Natali',
  'Nataly', 
  'Natalya',
  'Наталия',
  'Наталья',
  'Натали',
  'natali',
  'NATALI'
];

console.log('🔍 Проверяем разные варианты написания имени Natali...\n');

let checked = 0;

variants.forEach(variant => {
  https.get(`https://kupiyproday.onrender.com/users/check-nickname/${encodeURIComponent(variant)}`, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      checked++;
      const result = JSON.parse(data);
      
      if (result.available === false) {
        console.log(`✅ "${variant}" - ЗАНЯТ (пользователь существует)`);
      } else {
        console.log(`❌ "${variant}" - свободен`);
      }
      
      if (checked === variants.length) {
        console.log('\n✅ Проверка завершена');
      }
    });
  }).on('error', (e) => {
    console.error(`❌ Ошибка проверки "${variant}":`, e.message);
  });
});
