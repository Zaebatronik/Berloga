import { useTranslation } from 'react-i18next';

export default function AddListingPage() {
  const { t } = useTranslation();
  return <div className="container"><h1>{t('menu.addListing')}</h1><p>Add listing page - to be implemented</p></div>;
}
