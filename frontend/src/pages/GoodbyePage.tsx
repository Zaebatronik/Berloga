import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/GoodbyePage.css';

export default function GoodbyePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleReturn = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="goodbye-page">
      <div className="goodbye-content">
        <div className="goodbye-icon">😢</div>
        <h1 className="goodbye-title">{t('goodbye.title')}</h1>
        <p className="goodbye-message">
          {t('goodbye.message')}
          <br />
          {t('goodbye.hope')}
        </p>
        <div className="goodbye-emoji">🐻💔</div>
        <button className="return-button" onClick={handleReturn}>
          🏠 {t('goodbye.return')}
        </button>
        <p className="goodbye-hint">
          {t('goodbye.hint')}
        </p>
      </div>
    </div>
  );
}
