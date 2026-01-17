import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ColorPicker, Input, Modal, Toggle } from '@/components/common';
import type { Category, CreateCategoryInput } from '@superapp/shared-types';
import { IconPicker } from './IconPicker';

interface CategoryFormProps {
  isOpen: boolean;
  category: Category | null;
  onSubmit: (data: CreateCategoryInput) => void;
  onClose: () => void;
  loading: boolean;
}

export function CategoryForm({ isOpen, category, onSubmit, onClose, loading }: CategoryFormProps) {
  const { t } = useTranslation(['categories', 'common']);
  const [formData, setFormData] = useState<CreateCategoryInput>({
    name: '',
    description: '',
    color: '#3b82f6ff',
    icon: 'folder',
    isActive: true,
  });

  useEffect(() => {
    // Defer state updates to avoid cascading render warning
    setTimeout(() => {
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
          color: '#3b82f6ff',
          icon: 'folder',
          isActive: true,
        });
      }
    }, 0);
  }, [category, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? t('common:form.edit_title', { entity: t('categories:entity') }) : t('common:form.add_title', { entity: t('categories:entity') })}
      size="2xl"
      footer={
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            {t('common:cancel')}
          </Button>
          <Button type="submit" form="category-form" loading={loading} className="flex-1">
            {category ? t('common:save') : t('common:add')}
          </Button>
        </div>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('categories:form.name_label')}
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFormData({ ...formData, name: e.target.value }); }}
          placeholder={t('categories:form.name_placeholder')}
          required
        />
        <Input
          label={t('categories:form.desc_label')}
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFormData({ ...formData, description: e.target.value }); }}
          placeholder={t('categories:form.desc_placeholder')}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <ColorPicker
              label={t('categories:form.color_label')}
              value={formData.color}
              onChange={(color) => { setFormData({ ...formData, color }); }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
             <label className="text-sm font-medium text-foreground">{t('categories:form.active_label', { defaultValue: 'Status' })}</label>
             <Toggle
                checked={formData.isActive ?? true}
                onChange={(checked) => { setFormData({ ...formData, isActive: checked }); }}
                label={t('common:active')}
                description={t('categories:form.active_description')}
              />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">{t('categories:form.icon_label', { defaultValue: 'Icon' })}</label>
          <IconPicker 
            value={formData.icon} 
            onChange={(icon) => { setFormData({ ...formData, icon }); }} 
            color={formData.color}
          />
        </div>
      </form>
    </Modal>
  );
}
