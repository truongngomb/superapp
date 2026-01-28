/**
 * NotFoundPage Component
 * 404 Not Found page
 */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GradientText } from '../GradientText';

import { useDocumentTitle } from '@superapp/core-logic';

export interface NotFoundPageProps {
  appName?: string;
}

export function NotFoundPage({ appName }: NotFoundPageProps) {
  const { t } = useTranslation('uikit');
  
  useDocumentTitle(`404 | ${appName || t('uikit:brand')}`);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <GradientText className="text-6xl font-bold mb-4">404</GradientText>
      <p className="text-xl text-muted-foreground mb-6">
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
