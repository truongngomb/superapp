import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { z } from 'zod';
import { 
  MarkdownPageCreateSchema, 
  type MarkdownPage,
  type MarkdownPageCreateInput
} from '@superapp/shared-types';
import { 
  Button, 
  Input, 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Textarea, 
  Toggle, 
  Modal, 
  FileUploader, 
  MarkdownEditor
} from '@superapp/ui-kit';
import { generateSlug } from '@superapp/core-logic';
import { useMarkdownPages } from '@/hooks';
import { Wand2, Image as ImageIcon, FileText, Link as LinkIcon } from 'lucide-react';

// Extend schema with required boolean defaults
const FormSchema = MarkdownPageCreateSchema.extend({
  coverImage: z.union([z.string(), z.any()]).optional(), // Allow File object
  isDeleted: z.boolean().default(false),
  showInMenu: z.boolean().default(false),
  order: z.number().default(0),
  isPublished: z.boolean().default(true),
});

type FormValues = z.infer<typeof FormSchema>;

interface MarkdownPageFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: MarkdownPage;
  parentId?: string; // For creating child pages
}

export function MarkdownPageForm({ 
  open, 
  onClose, 
  initialData, 
  parentId 
}: MarkdownPageFormProps) {
  const { t } = useTranslation(['markdown', 'common']);
  const { createPage, updatePage, submitting } = useMarkdownPages();
  const isEdit = !!initialData;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    resolver: zodResolver(FormSchema) as any, // Cast due to extended schema
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      icon: '',
      showInMenu: false,
      menuPosition: undefined,
      parentId: parentId || '', // Use parentId if provided
      order: 0,
      isPublished: true,
      ...initialData,
    },
  });

  const title = useWatch({ control, name: 'title' });
  const slug = useWatch({ control, name: 'slug' });
  const showInMenu = useWatch({ control, name: 'showInMenu' });

  // Auto-generate slug from title
  useEffect(() => {
    if (!open) return;
    
    // Only auto-generate if we are creating new page OR slug is empty
    // And user hasn't manually edited slug (we assume raw match means auto)
    if (!isEdit && title && (!slug || generateSlug(title).startsWith(slug))) {
      const newSlug = generateSlug(title);
      setValue('slug', newSlug, { shouldValidate: true });
    }
  }, [title, isEdit, open, setValue, slug]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      reset({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        icon: '',
        showInMenu: false,
        menuPosition: undefined,
        parentId: parentId || '',
        isPublished: true,
        ...initialData,
      });
    }
  }, [open, initialData, parentId, reset]);

  const onSubmit = async (data: FormValues) => {
    let success = false;

    // Check if we need FormData (for file upload)
    const hasFile = data.coverImage instanceof File;
    
    // Prepare payload
    let payload: MarkdownPageCreateInput | FormData;

    if (hasFile) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'coverImage' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      payload = formData as any; // Cast for TS
    } else {
      payload = data as MarkdownPageCreateInput;
    }

    if (isEdit) {
      success = await updatePage(initialData.id, payload);
    } else {
      success = await createPage(payload);
    }

    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={isEdit ? t('edit_title') : t('create_title')}
      size="full"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            {t('common:actions.cancel')}
          </Button>
          <Button type="submit" form="markdown-page-form" loading={submitting}>
            {isEdit ? t('common:actions.save') : t('common:actions.create')}
          </Button>
        </div>
      }
    >
      <form 
        id="markdown-page-form"
        onSubmit={(e) => { e.preventDefault(); void handleSubmit(onSubmit)(e); }} 
        className="space-y-4"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('form.title')}</label>
              <Input
                {...register('title')}
                placeholder={t('form.title_placeholder')}
                error={errors.title?.message}
                autoFocus
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center justify-between">
                {t('form.slug')}
                <span className="text-xs text-muted font-normal">{t('form.slug_help')}</span>
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <Input
                  {...register('slug')}
                  className="pl-9 pr-10"
                  placeholder={t('form.slug_placeholder')}
                  error={errors.slug?.message}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => { setValue('slug', generateSlug(title), { shouldValidate: true }); }}
                  title={t('form.auto_generate_slug')}
                >
                  <Wand2 className="w-4 h-4 text-primary" />
                </Button>
              </div>
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('form.content')}</label>
              <div className="min-h-[400px]">
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <MarkdownEditor
                      value={field.value}
                      onChange={field.onChange}
                      height={400}
                    />
                  )}
                />
                {errors.content && (
                  <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
                )}
              </div>
            </div>
            
            {/* Excerpt */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('form.excerpt')}</label>
              <Textarea
                {...register('excerpt')}
                placeholder={t('form.excerpt_placeholder')}
                rows={3}
              />
            </div>
          </div>

          {/* Right Column: Settings */}
          <div className="space-y-4">
            
            {/* Publish Status */}
            <div className="bg-surface/50 p-4 rounded-lg border space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t('form.settings')}
              </h3>
              
              <div className="flex items-center justify-between">
                <label className="text-sm cursor-pointer" htmlFor="isPublished">
                  {t('form.published')}
                </label>
                <Controller
                  name="isPublished"
                  control={control}
                  render={({ field }) => (
                    <Toggle
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <label className="text-sm cursor-pointer" htmlFor="showInMenu">
                  {t('form.show_in_menu')}
                </label>
                <Controller
                  name="showInMenu"
                  control={control}
                  render={({ field }) => (
                    <Toggle
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              {showInMenu && (
                <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted">{t('form.menu_position')}</label>
                    <Controller
                      name="menuPosition"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('form.select_position')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="header">{t('menu_position.header')}</SelectItem>
                            <SelectItem value="footer">{t('menu_position.footer')}</SelectItem>
                            <SelectItem value="sidebar">{t('menu_position.sidebar')}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs text-muted">{t('form.order')}</label>
                    <Input
                      type="number"
                      {...register('order', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Assets */}
            <div className="bg-surface/50 p-4 rounded-lg border space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                {t('form.assets')}
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-medium">{t('form.cover_image')}</label>
                <Controller
                  name="coverImage"
                  control={control}
                  render={({ field }) => (
                    <FileUploader
                      value={field.value as File | string | undefined}
                      onChange={field.onChange}
                      preview
                      label={t('form.cover_image')}
                      className="w-full"
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">{t('form.icon')}</label>
                <Input
                  {...register('icon')}
                  placeholder={t('form.icon_placeholder')}
                />
              </div>
            </div>

          </div>
        </div>
      </form>

    </Modal>

  );
}
