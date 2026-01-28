
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@superapp/ui-kit';
import type { MarkdownPage } from '@superapp/shared-types';

interface LanguageManagementButtonProps {
  page: MarkdownPage;
  onManageTranslations: (page: MarkdownPage) => void;
}

export function LanguageManagementButton({ page, onManageTranslations }: LanguageManagementButtonProps) {
  const { t } = useTranslation(['markdown']);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={(e) => {
        e.stopPropagation();
        onManageTranslations(page);
      }}
      title={t('form.manage_translations')}
    >
      <Languages className="w-4 h-4 text-blue-600 dark:text-blue-400" />
    </Button>
  );
}
