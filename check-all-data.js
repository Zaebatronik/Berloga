const API_URL = 'https://kupiyproday.onrender.com';

async function checkAllData() {
  try {
    console.log('🔍 ========== ПРОВЕРКА ВСЕХ ДАННЫХ ==========\n');
    
    // 1. Проверка пользователей
    console.log('👥 ПОЛЬЗОВАТЕЛИ:');
    const usersResponse = await fetch(`${API_URL}/api/users`);
    const users = await usersResponse.json();
    console.log(`   Всего: ${users.length}`);
    users.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.nickname} | ID: ${user.telegramId} | ${user.country}, ${user.city}`);
    });
    
    // 2. Проверка объявлений
    console.log('\n📦 ОБЪЯВЛЕНИЯ:');
    const listingsResponse = await fetch(`${API_URL}/api/listings`);
    const listings = await listingsResponse.json();
    console.log(`   Всего: ${listings.length}`);
    listings.forEach((listing, i) => {
      console.log(`   ${i + 1}. "${listing.title}" | ${listing.country}, ${listing.city} | User: ${listing.userNickname}`);
    });
    
    // 3. Проверка чатов
    console.log('\n💬 ЧАТЫ:');
    const chatsResponse = await fetch(`${API_URL}/api/chats`);
    const chats = await chatsResponse.json();
    console.log(`   Всего: ${chats.length}`);
    chats.forEach((chat, i) => {
      console.log(`   ${i + 1}. ID: ${chat._id} | Участники: ${chat.participant1} ↔ ${chat.participant2} | Сообщений: ${chat.messages?.length || 0}`);
    });
    
    // 4. Проверка репортов
    console.log('\n🚨 РЕПОРТЫ:');
    try {
      const reportsResponse = await fetch(`${API_URL}/api/reports`);
      const reports = await reportsResponse.json();
      console.log(`   Всего: ${reports.length}`);
      reports.forEach((report, i) => {
        console.log(`   ${i + 1}. От: ${report.reporterTelegramId} | Тип: ${report.reportType} | Статус: ${report.status}`);
      });
    } catch (e) {
      console.log('   Не удалось загрузить репорты');
    }
    
    console.log('\n✅ ========== ПРОВЕРКА ЗАВЕРШЕНА ==========');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

checkAllData();
