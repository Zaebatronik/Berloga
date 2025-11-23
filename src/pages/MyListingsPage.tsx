import { useTranslation } from 'react-i18next';

export default function MyListingsPage() {
  const { t } = useTranslation();
  return <div className="container"><h1>{t('menu.myListings')}</h1><p>My listings page - to be implemented</p></div>;
}
