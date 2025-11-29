const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://kamarovdanila228:JybumQhsIGOGEzK6@kupyprodai.1iomu.mongodb.net/kupyprodai';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Модель пользователя
    const User = mongoose.model('User', new mongoose.Schema({
      telegramId: String,
      nickname: String,
      banned: Boolean,
      createdAt: Date
    }, {strict: false}));
    
    // Модель объявления
    const Listing = mongoose.model('Listing', new mongoose.Schema({
      userId: String,
      userNickname: String,
      title: String,
      createdAt: Date
    }, {strict: false}));
    
    console.log('\n🔍 ПОИСК NATALI...\n');
    
    // 1. Ищем пользователя Natali
    const nataliUser = await User.findOne({ 
      nickname: { $regex: /natali/i } 
    });
    
    if (nataliUser) {
      console.log('✅ НАЙДЕН ПОЛЬЗОВАТЕЛЬ NATALI В БАЗЕ:');
      console.log('   Telegram ID:', nataliUser.telegramId);
      console.log('   Nickname:', nataliUser.nickname);
      console.log('   Banned:', nataliUser.banned ? '🚫 ДА' : '✅ НЕТ');
      console.log('   Created:', nataliUser.createdAt);
      console.log('   MongoDB _id:', nataliUser._id);
      
      // Ищем её объявления
      const nataliListings = await Listing.find({ userId: nataliUser.telegramId });
      console.log(`\n📋 Объявлений Natali: ${nataliListings.length}`);
      nataliListings.forEach((l, i) => {
        console.log(`   ${i+1}. ${l.title} (Created: ${l.createdAt})`);
      });
    } else {
      console.log('❌ Пользователь Natali НЕ НАЙДЕН в таблице users');
    }
    
    // 2. Ищем объявления с userNickname = Natali
    console.log('\n🔍 ПОИСК ОБЪЯВЛЕНИЙ С NICKNAME "NATALI"...\n');
    const listingsByNickname = await Listing.find({ 
      userNickname: { $regex: /natali/i } 
    });
    
    if (listingsByNickname.length > 0) {
      console.log(`✅ НАЙДЕНО ${listingsByNickname.length} ОБЪЯВЛЕНИЙ:`);
      listingsByNickname.forEach((l, i) => {
        console.log(`\n${i+1}. Title: ${l.title}`);
        console.log(`   User ID: ${l.userId}`);
        console.log(`   User Nickname: ${l.userNickname}`);
        console.log(`   Created: ${l.createdAt}`);
      });
      
      // Получаем уникальные userId из объявлений Natali
      const uniqueUserIds = [...new Set(listingsByNickname.map(l => l.userId))];
      console.log(`\n📊 Уникальные User ID в объявлениях Natali: ${uniqueUserIds.join(', ')}`);
      
      // Проверяем есть ли эти ID в таблице users
      for (const userId of uniqueUserIds) {
        const user = await User.findOne({ telegramId: userId });
        if (user) {
          console.log(`\n✅ User ID ${userId} НАЙДЕН в базе users:`);
          console.log(`   Nickname: ${user.nickname}`);
          console.log(`   Banned: ${user.banned}`);
        } else {
          console.log(`\n❌ User ID ${userId} НЕ НАЙДЕН в базе users! (ФЕЙКОВЫЙ ПОЛЬЗОВАТЕЛЬ)`);
        }
      }
    } else {
      console.log('❌ Объявления с nickname Natali не найдены');
    }
    
    // 3. Показываем ВСЕ объявления с фейковыми userId
    console.log('\n\n🔍 ПОИСК ФЕЙКОВЫХ ОБЪЯВЛЕНИЙ (userId не в базе users)...\n');
    const allListings = await Listing.find({});
    const allUsers = await User.find({});
    const validUserIds = new Set(allUsers.map(u => u.telegramId));
    
    const fakeListings = allListings.filter(l => !validUserIds.has(l.userId));
    
    if (fakeListings.length > 0) {
      console.log(`🚫 НАЙДЕНО ${fakeListings.length} ФЕЙКОВЫХ ОБЪЯВЛЕНИЙ:`);
      fakeListings.forEach((l, i) => {
        console.log(`\n${i+1}. Title: ${l.title}`);
        console.log(`   User ID: ${l.userId} ⚠️ НЕ В БАЗЕ`);
        console.log(`   User Nickname: ${l.userNickname}`);
        console.log(`   Created: ${l.createdAt}`);
      });
    } else {
      console.log('✅ Фейковых объявлений не найдено');
    }
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
