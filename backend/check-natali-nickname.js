// Проверка через check-nickname (публичный endpoint)
const https = require('https');

console.log('🔍 Проверяем существует ли никнейм Natali...\n');

const req = https.get('https://kupiyproday.onrender.com/users/check-nickname/Natali', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    
    const result = JSON.parse(data);
    if (result.available === false) {
      console.log('\n✅ НИКНЕЙМ "Natali" ЗАНЯТ - пользователь СУЩЕСТВУЕТ в базе!');
    } else {
      console.log('\n❌ НИКНЕЙМ "Natali" СВОБОДЕН - пользователя НЕТ в базе!');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});
