import { useTranslation } from 'react-i18next';

export default function ProfilePage() {
  const { t } = useTranslation();
  return <div className="container"><h1>{t('profile.title')}</h1><p>Profile page - to be implemented</p></div>;
}
