/**
 * NotFoundPage Component
 * 404 Not Found page
 */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-6xl font-bold text-gradient mb-4">404</h1>
      <p className="text-xl text-muted mb-6">
        {t('errors.page_not_found', { defaultValue: 'Page not found' })}
      </p>
      <Link
        to="/"
        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        {t('actions.back_to_home', { defaultValue: 'Back to Home' })}
      </Link>
    </div>
  );
}
