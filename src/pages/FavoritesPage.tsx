import { useTranslation } from 'react-i18next';

export default function FavoritesPage() {
  const { t } = useTranslation();
  return <div className="container"><h1>{t('favorites.title')}</h1><p>Favorites page - to be implemented</p></div>;
}
