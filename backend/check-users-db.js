const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://kamarovdanila228:JybumQhsIGOGEzK6@kupyprodai.1iomu.mongodb.net/kupyprodai';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const User = mongoose.model('User', new mongoose.Schema({
      telegramId: String,
      nickname: String,
      banned: Boolean,
      createdAt: Date
    }, {strict: false}));
    
    const users = await User.find({}).sort({ createdAt: -1 });
    
    console.log('\n📊 ВСЕГО ПОЛЬЗОВАТЕЛЕЙ В БАЗЕ:', users.length);
    console.log('='.repeat(80));
    
    users.forEach((u, i) => {
      console.log(`\n${i+1}. Telegram ID: ${u.telegramId}`);
      console.log(`   Nickname: ${u.nickname}`);
      console.log(`   Banned: ${u.banned ? '🚫 ДА' : '✅ НЕТ'}`);
      console.log(`   Created: ${u.createdAt}`);
      console.log(`   MongoDB _id: ${u._id}`);
    });
    
    console.log('\n' + '='.repeat(80));
    
    // Ищем Наталию
    const natali = users.find(u => u.nickname && u.nickname.toLowerCase().includes('натал'));
    if (natali) {
      console.log('\n🔍 НАЙДЕНА НАТАЛИЯ:');
      console.log('   Telegram ID:', natali.telegramId);
      console.log('   Nickname:', natali.nickname);
      console.log('   Banned:', natali.banned);
    } else {
      console.log('\n❌ Наталия не найдена в базе');
    }
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
