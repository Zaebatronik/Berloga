import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { locationService, Country, City } from '../services/location';
import '../styles/CountryPage.css';

const popularCountries: Country[] = [
  { code: 'RU', name: 'Россия', nameRu: 'Россия', flag: '🇷🇺' },
  { code: 'UA', name: 'Україна', nameRu: 'Украина', flag: '🇺🇦' },
  { code: 'BY', name: 'Беларусь', nameRu: 'Беларусь', flag: '🇧🇾' },
  { code: 'KZ', name: 'Қазақстан', nameRu: 'Казахстан', flag: '🇰🇿' },
  { code: 'DE', name: 'Deutschland', nameRu: 'Германия', flag: '🇩🇪' },
  { code: 'FR', name: 'France', nameRu: 'Франция', flag: '🇫🇷' },
  { code: 'ES', name: 'España', nameRu: 'Испания', flag: '🇪🇸' },
  { code: 'PL', name: 'Polska', nameRu: 'Польша', flag: '🇵🇱' },
  { code: 'US', name: 'USA', nameRu: 'США', flag: '🇺🇸' },
  { code: 'GB', name: 'UK', nameRu: 'Великобритания', flag: '🇬🇧' },
];

export default function LocationPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [step, setStep] = useState<'country' | 'city'>('country');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  
  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Загрузка городов при выборе страны
  useEffect(() => {
    if (selectedCountry && step === 'city') {
      loadCities();
    }
  }, [selectedCountry, step]);

  const loadCities = async () => {
    if (!selectedCountry) return;
    setLoadingCities(true);
    try {
      const data = await locationService.getCities(selectedCountry.nameRu);
      setCities(data);
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    setTimeout(() => setStep('city'), 300);
  };

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
    
    // Сохраняем выбор
    localStorage.setItem('registrationCountry', JSON.stringify(selectedCountry));
    localStorage.setItem('registrationCity', city.nameRu);
    
    setTimeout(() => navigate('/radius'), 300);
  };

  const handleGeolocation = async () => {
    setLoadingLocation(true);
    
    try {
      // Проверяем Telegram WebApp API
      if (window.Telegram?.WebApp?.LocationManager) {
        window.Telegram.WebApp.LocationManager.getLocation((location) => {
          if (location) {
            reverseGeocode(location.latitude, location.longitude);
          } else {
            fallbackToNavigator();
          }
        });
      } else {
        fallbackToNavigator();
      }
    } catch (error) {
      console.error('Geolocation error:', error);
      setLoadingLocation(false);
      alert(t('registration.geolocationError') || 'Не удалось определить местоположение');
    }
  };

  const fallbackToNavigator = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          reverseGeocode(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Navigator geolocation error:', error);
          setLoadingLocation(false);
          alert(t('registration.geolocationError') || 'Не удалось определить местоположение. Выберите вручную.');
        }
      );
    } else {
      setLoadingLocation(false);
      alert(t('registration.geolocationNotSupported') || 'Геолокация не поддерживается');
    }
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ru`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const country = data.address.country;
        const city = data.address.city || data.address.town || data.address.village;
        
        if (country && city) {
          // Ищем страну в списке
          const foundCountry = popularCountries.find(c => 
            c.nameRu.toLowerCase() === country.toLowerCase() || 
            c.name.toLowerCase() === country.toLowerCase()
          );
          
          if (foundCountry) {
            setSelectedCountry(foundCountry);
            setStep('city');
            
            // Загружаем города и ищем нужный
            const citiesData = await locationService.getCities(foundCountry.nameRu);
            setCities(citiesData);
            
            const foundCity = citiesData.find(c => 
              c.nameRu.toLowerCase() === city.toLowerCase() ||
              c.name.toLowerCase() === city.toLowerCase()
            );
            
            if (foundCity) {
              setCitySearch(foundCity.nameRu);
            } else {
              setCitySearch(city);
            }
          }
        }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      alert(t('registration.geolocationError') || 'Не удалось определить местоположение');
    } finally {
      setLoadingLocation(false);
    }
  };

  const filteredCountries = popularCountries.filter((country) =>
    country.nameRu.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredCities = cities.filter((city) =>
    city.nameRu.toLowerCase().includes(citySearch.toLowerCase()) ||
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Рендер страницы выбора страны
  if (step === 'country') {
    return (
      <div className="country-page">
        <div className="container">
          <h1 className="page-title">{t('registration.selectCountry')}</h1>
          <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '15px' }}>
            {t('registration.locationHint')}
          </p>

          <button
            onClick={handleGeolocation}
            disabled={loadingLocation}
            style={{
              width: '100%',
              marginBottom: '20px',
              padding: '16px',
              borderRadius: '16px',
              border: '2px solid #667eea',
              background: 'white',
              color: '#667eea',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loadingLocation ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loadingLocation ? '⏳ Определяем...' : '📍 Определить автоматически'}
          </button>

          <div style={{ 
            textAlign: 'center', 
            color: '#94a3b8', 
            fontSize: '14px',
            margin: '16px 0',
            position: 'relative'
          }}>
            <span style={{ 
              background: 'white', 
              padding: '0 12px',
              position: 'relative',
              zIndex: 1
            }}>
              или выберите вручную
            </span>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '1px',
              background: '#e5e7eb',
              zIndex: 0
            }} />
          </div>

          <input
            type="text"
            className="input search-input"
            placeholder={t('registration.searchCountry')}
            value={countrySearch}
            onChange={(e) => setCountrySearch(e.target.value)}
            style={{ marginBottom: '16px' }}
          />

          <div className="country-list">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                className={`country-item ${selectedCountry?.code === country.code ? 'selected' : ''}`}
                onClick={() => handleCountrySelect(country)}
              >
                <span className="country-flag">{country.flag}</span>
                <span className="country-name">{country.nameRu}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Рендер страницы выбора города
  return (
    <div className="country-page">
      <div className="container">
        <button
          onClick={() => {
            setStep('country');
            setSelectedCity(null);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#667eea',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 0'
          }}
        >
          ← {t('registration.back')}
        </button>

        <h1 className="page-title">{t('registration.selectCity')}</h1>
        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '15px' }}>
          {selectedCountry?.flag} {selectedCountry?.nameRu}
        </p>

        <input
          type="text"
          className="input search-input"
          placeholder={t('registration.searchCity')}
          value={citySearch}
          onChange={(e) => setCitySearch(e.target.value)}
          style={{ marginBottom: '16px' }}
          autoFocus
        />

        {loadingCities ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            Загрузка городов...
          </div>
        ) : filteredCities.length > 0 ? (
          <div className="country-list">
            {filteredCities.slice(0, 50).map((city) => (
              <button
                key={city.nameRu}
                className={`country-item ${selectedCity?.nameRu === city.nameRu ? 'selected' : ''}`}
                onClick={() => handleCitySelect(city)}
              >
                <span className="country-name">{city.nameRu}</span>
              </button>
            ))}
            {filteredCities.length > 50 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '12px', 
                color: '#94a3b8',
                fontSize: '14px'
              }}>
                Показаны первые 50 результатов. Уточните запрос для более точного поиска.
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            {citySearch ? 'Ничего не найдено. Попробуйте другой запрос.' : 'Начните вводить название города'}
          </div>
        )}
      </div>
    </div>
  );
}
