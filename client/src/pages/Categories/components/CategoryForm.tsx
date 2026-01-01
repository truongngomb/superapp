import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal } from '@/components/common';
import type { Category, CategoryInput } from '@/types';

interface CategoryFormProps {
  isOpen: boolean;
  category: Category | null;
  onSubmit: (data: CategoryInput) => void;
  onClose: () => void;
  loading: boolean;
}

export function CategoryForm({ isOpen, category, onSubmit, onClose, loading }: CategoryFormProps) {
  const { t } = useTranslation(['categories', 'common']);
  const [formData, setFormData] = useState<CategoryInput>({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: 'folder',
    isActive: true,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        color: category.color,
        icon: category.icon,
        isActive: category.isActive,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#3b82f6',
        icon: 'folder',
        isActive: true,
      });
    }
  }, [category, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? t('categories:form.edit_title') : t('categories:form.add_title')}
      size="md"
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            {t('common:cancel')}
          </Button>
          <Button type="submit" form="category-form" loading={loading} className="flex-1">
            {category ? t('categories:form.submit_update') : t('categories:form.submit_add')}
          </Button>
        </div>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('categories:form.name_label')}
          value={formData.name}
          onChange={(e) => { setFormData({ ...formData, name: e.target.value }); }}
          placeholder={t('categories:form.name_placeholder')}
          required
        />
        <Input
          label={t('categories:form.desc_label')}
          value={formData.description}
          onChange={(e) => { setFormData({ ...formData, description: e.target.value }); }}
          placeholder={t('categories:form.desc_placeholder')}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">{t('categories:form.color_label')}</label>
          <input
            type="color"
            value={formData.color}
            onChange={(e) => { setFormData({ ...formData, color: e.target.value }); }}
            className="w-full h-10 rounded-lg cursor-pointer"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive ?? true}
            onChange={(e) => { setFormData({ ...formData, isActive: e.target.checked }); }}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-foreground">
            {t('categories:form.active_label')}
          </label>
        </div>
      </form>
    </Modal>
  );
}
