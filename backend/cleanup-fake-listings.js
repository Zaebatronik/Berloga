const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://kamarovdanila228:JybumQhsIGOGEzK6@kupyprodai.1iomu.mongodb.net/kupyprodai';

// Фейковые user ID (те которых нет в базе users)
const FAKE_USER_IDS = [
  '360295602',
  '8078348184',
  '6844823856',
  '7300842315',
  '5425219776'
];

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    const Listing = mongoose.model('Listing', new mongoose.Schema({
      userId: String,
      userNickname: String,
      title: String
    }, {strict: false}));
    
    console.log('🗑️ УДАЛЕНИЕ ФЕЙКОВЫХ ОБЪЯВЛЕНИЙ:\n');
    
    for (const fakeUserId of FAKE_USER_IDS) {
      const listings = await Listing.find({ userId: fakeUserId });
      console.log(`User ID: ${fakeUserId}`);
      
      if (listings.length > 0) {
        console.log(`  Найдено объявлений: ${listings.length}`);
        listings.forEach((l, i) => {
          console.log(`    ${i+1}. ${l.title} (${l.userNickname})`);
        });
        
        const result = await Listing.deleteMany({ userId: fakeUserId });
        console.log(`  ✅ Удалено: ${result.deletedCount} объявлений\n`);
      } else {
        console.log(`  ℹ️ Объявлений не найдено\n`);
      }
    }
    
    // Проверяем что осталось
    const remaining = await Listing.find({});
    console.log(`\n📊 ИТОГО осталось объявлений: ${remaining.length}`);
    
    const byUser = {};
    remaining.forEach(l => {
      if (!byUser[l.userId]) {
        byUser[l.userId] = { nickname: l.userNickname, count: 0 };
      }
      byUser[l.userId].count++;
    });
    
    console.log('\n✅ ЧИСТЫЕ ПОЛЬЗОВАТЕЛИ:');
    Object.entries(byUser).forEach(([userId, data]) => {
      console.log(`  ${userId} (${data.nickname}): ${data.count} объявлений`);
    });
    
    mongoose.disconnect();
    console.log('\n✅ Очистка завершена!');
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
