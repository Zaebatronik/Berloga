const API_URL = 'https://kupiyproday.onrender.com';

async function restoreUsers() {
  try {
    console.log('🔧 ========== ВОССТАНОВЛЕНИЕ ПОЛЬЗОВАТЕЛЕЙ ==========\n');
    
    // 1. Получаем все объявления
    const listingsResponse = await fetch(`${API_URL}/api/listings`);
    const listings = await listingsResponse.json();
    console.log(`📦 Найдено объявлений: ${listings.length}\n`);
    
    // 2. Получаем существующих пользователей
    const usersResponse = await fetch(`${API_URL}/api/users`);
    const existingUsers = await usersResponse.json();
    const existingUserIds = new Set(existingUsers.map(u => u.telegramId));
    console.log(`👥 Существующих пользователей: ${existingUsers.length}\n`);
    
    // 3. Находим уникальных создателей объявлений
    const creators = new Map();
    listings.forEach(listing => {
      if (!existingUserIds.has(listing.userId)) {
        if (!creators.has(listing.userId)) {
          creators.set(listing.userId, {
            telegramId: listing.userId,
            nickname: listing.userNickname,
            country: listing.country,
            city: listing.city
          });
        }
      }
    });
    
    console.log(`🔍 Найдено пользователей без аккаунтов: ${creators.size}\n`);
    
    if (creators.size === 0) {
      console.log('✅ Все пользователи уже существуют!');
      return;
    }
    
    // 4. Создаём отсутствующих пользователей
    for (const [userId, userData] of creators.entries()) {
      console.log(`➕ Создаю пользователя: ${userData.nickname} (${userId})`);
      
      try {
        const response = await fetch(`${API_URL}/api/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: userData.telegramId,  // Роут ожидает 'id', а не 'telegramId'
            nickname: userData.nickname,
            telegramUsername: userData.nickname,
            country: userData.country,
            city: userData.city,
            radius: 50,
            language: 'ru',
            contacts: {}
          })
        });
        
        if (response.ok) {
          const newUser = await response.json();
          console.log(`   ✅ Создан: ${newUser.nickname}`);
        } else {
          const error = await response.text();
          console.log(`   ⚠️ Ошибка: ${error}`);
        }
      } catch (error) {
        console.log(`   ❌ Ошибка создания: ${error.message}`);
      }
    }
    
    console.log('\n✅ ========== ВОССТАНОВЛЕНИЕ ЗАВЕРШЕНО ==========');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

restoreUsers();
