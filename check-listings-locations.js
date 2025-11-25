const API_URL = 'https://kupiyproday.onrender.com';

async function checkListings() {
  try {
    console.log('📦 Получаю все объявления...\n');
    
    const response = await fetch(`${API_URL}/api/listings`);
    const listings = await response.json();
    
    console.log(`✅ Всего объявлений: ${listings.length}\n`);
    
    // Группируем по странам
    const byCountry = {};
    const byCity = {};
    
    listings.forEach(listing => {
      const country = listing.country || 'НЕ УКАЗАНА';
      const city = listing.city || 'НЕ УКАЗАН';
      
      if (!byCountry[country]) byCountry[country] = [];
      if (!byCity[city]) byCity[city] = [];
      
      byCountry[country].push(listing);
      byCity[city].push(listing);
    });
    
    console.log('🌍 ОБЪЯВЛЕНИЯ ПО СТРАНАМ:');
    Object.keys(byCountry).sort().forEach(country => {
      console.log(`   ${country}: ${byCountry[country].length} объявлений`);
      byCountry[country].forEach(l => {
        console.log(`      - "${l.title}" | Город: "${l.city}"`);
      });
    });
    
    console.log('\n🏙️ ОБЪЯВЛЕНИЯ ПО ГОРОДАМ:');
    Object.keys(byCity).sort().forEach(city => {
      console.log(`   ${city}: ${byCity[city].length} объявлений`);
    });
    
    console.log('\n📊 ДЕТАЛИ ВСЕХ ОБЪЯВЛЕНИЙ:');
    listings.forEach((listing, index) => {
      console.log(`\n${index + 1}. "${listing.title}"`);
      console.log(`   ID: ${listing._id}`);
      console.log(`   Страна: "${listing.country}"`);
      console.log(`   Город: "${listing.city}"`);
      console.log(`   Пользователь: ${listing.userNickname} (${listing.userId})`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

checkListings();
