import { Languages } from 'lucide-react';
import { Button } from '@superapp/ui-kit';
import { useTranslation } from 'react-i18next';
import type { MarkdownPage } from '@superapp/shared-types';

interface LanguageManagementButtonProps {
  page: MarkdownPage;
  onManageTranslations: (page: MarkdownPage) => void;
}

export function LanguageManagementButton({ 
  page, 
  onManageTranslations 
}: LanguageManagementButtonProps) {
  const { t } = useTranslation('markdown');
  
  // Count number of languages with content
  const translationCount = Object.values(page.translations).filter(
    (trans) => trans.title && trans.slug
  ).length;
  
  return (
    <Button
      variant="ghost"
      size="sm"
      title={t('form.manage_translations')}
      onClick={(e) => {
        e.stopPropagation();
        onManageTranslations(page);
      }}
      className="gap-2"
    >
      <Languages className="w-4 h-4" />
      <span className="text-xs">{t('form.translation_count', { count: translationCount })}</span>
    </Button>
  );
}
