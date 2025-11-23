import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import '../styles/MainMenu.css';

export default function MainMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { clearUser, user } = useStore();
  const [unreadCount, setUnreadCount] = useState(0);

  // ID админа
  const ADMIN_ID = '670170626';
  const currentUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || '';
  const isAdmin = currentUserId === ADMIN_ID;

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Загрузка количества непрочитанных уведомлений
  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`${API_URL}/notifications/${user.id}?unreadOnly=true`);
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();
    // Обновляем каждые 30 секунд
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const menuItems = [
    { icon: '📁', label: t('menu.catalog'), path: '/catalog' },
    { icon: '➕', label: t('menu.addListing'), path: '/add' },
    { icon: '📋', label: t('menu.myListings'), path: '/my-listings' },
    { icon: '👤', label: t('menu.profile'), path: '/profile' },
    { icon: '⭐', label: t('menu.favorites'), path: '/favorites' },
    { icon: '❓', label: t('menu.support'), path: '/support' },
    ...(isAdmin ? [{ icon: '👑', label: 'Админ-панель', path: '/admin' }] : []),
  ];

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти? Придётся пройти регистрацию заново.')) {
      // Очищаем данные пользователя и состояние регистрации
      clearUser();
      localStorage.clear();
      // Переходим на страницу прощания
      navigate('/goodbye', { replace: true });
    }
  };

  return (
    <div className="main-menu">
      <div className="menu-header">
        <button className="logout-button" onClick={handleLogout}>
          🚪
        </button>
        <h1>🐻 Берлога</h1>
        <button 
          className="notification-bell" 
          onClick={() => navigate('/notifications')}
        >
          🔔
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </button>
        <p className="menu-description">Покупай и продавай что угодно рядом с домом</p>
      </div>
      <div className="menu-grid">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className="menu-item"
            onClick={() => navigate(item.path)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
