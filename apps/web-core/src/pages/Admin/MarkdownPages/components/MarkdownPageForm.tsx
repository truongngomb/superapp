import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { z } from 'zod';
import { 
  MarkdownPageCreateSchema, 
  type MarkdownPage,
  type MarkdownPageCreateInput,
  type SupportedLanguage,
  type MarkdownPageTranslation
} from '@superapp/shared-types';
import { 
  Button, 
  Input, 
  Textarea, 
  Toggle, 
  Modal, 
  FileUploader, 
  // MarkdownEditor, // Lazy loaded below
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  IconPicker,
  CATEGORY_ICONS
} from '@superapp/ui-kit';
import { generateSlug } from '@superapp/core-logic';
import { useMarkdownPages, useDebounce, useMediaUpload } from '@/hooks';
import { useToast } from '@/context';
import { markdownService } from '@/services/markdown.service';
import { Wand2, FileText, Link as LinkIcon, Folder, Copy, X, Loader2 } from 'lucide-react';
import { MediaManagerModal } from '@/components/MediaManager/MediaManagerModal';

// Lazy load the editor
const LazyMarkdownEditor = lazy(() => import('@superapp/ui-kit').then(module => ({ default: module.MarkdownEditor })));

// Extend schema with required boolean defaults and file handling
// Schema for Type Inference only (Static)
export const FormSchemaType = MarkdownPageCreateSchema.extend({
  coverImage: z.union([z.string(), z.any()]).optional(), 
  isDeleted: z.boolean().default(false),
  isTitle: z.boolean().default(false),
  showInMenu: z.boolean().default(false),
  order: z.number().default(0),
  isPublished: z.boolean().default(true),
  translations: z.record(z.string(), z.object({
    title: z.string(), 
    slug: z.string(),
    content: z.string(),
    excerpt: z.string().optional(),
    menuTitle: z.string().optional(),
  })),
});

type FormValues = z.infer<typeof FormSchemaType>;


interface MarkdownPageFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: MarkdownPage;
  parentId?: string; // For creating child pages
  manageAllLanguages?: boolean; // If true, show all language tabs. If false, only show default language
  onSuccess?: () => void;
}

const LANGUAGES: { value: SupportedLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'ko', label: 'Korean' }
];

export function MarkdownPageForm({ 
  open, 
  onClose, 
  initialData, 
  parentId,
  manageAllLanguages = false, // Default: only edit default language
  onSuccess
}: MarkdownPageFormProps) {
  const { t, i18n } = useTranslation(['markdown', 'common']);
  const toast = useToast();
  const { createPage, updatePage, submitting, getAllPages } = useMarkdownPages();
  const { upload: uploadImage } = useMediaUpload(initialData?.id, 'markdown_pages');
  const isEdit = !!initialData;
  const [parentOptions, setParentOptions] = useState<{ value: string; label: string }[]>([]);
  const [translating, setTranslating] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  
  // Media Manager State
  const [mediaManagerOpen, setMediaManagerOpen] = useState(false);
  const mediaResolver = useRef<((url: string | undefined) => void) | null>(null);

  const handleBrowseImage = useCallback((): Promise<string | undefined> => {
    return new Promise((resolve) => {
      mediaResolver.current = resolve;
      setMediaManagerOpen(true);
    });
  }, []);

  const handleMediaSelect = (url: string) => {
    if (mediaResolver.current) {
      mediaResolver.current(url);
      mediaResolver.current = null;
    }
    setMediaManagerOpen(false);
  };
  
  // Close handler for media manager (user cancelled)
  const handleMediaClose = () => {
    if (mediaResolver.current) {
      mediaResolver.current(undefined);
      mediaResolver.current = null;
    }
    setMediaManagerOpen(false);
  };

  // Get current user language
  const currentLang = (i18n.language.startsWith('vi') ? 'vi' : 
                      i18n.language.startsWith('ko') ? 'ko' : 
                      'en') as SupportedLanguage;

  // Detect default language from translations or use current language
  const [defaultLanguage, setDefaultLanguage] = useState<SupportedLanguage>(() => {
    if (!initialData) return currentLang; // Use current language for new pages
    
    // Explicit default language from DB takes precedence
    if (initialData.defaultLanguage) {
      return initialData.defaultLanguage;
    }

    // Fallback: find first language with title + slug
    for (const lang of LANGUAGES) {
      const trans = initialData.translations[lang.value];
      if (trans && trans.title && trans.slug) {
        return lang.value;
      }
    }
    return currentLang;
  });

  // Set active tab to default language initially
  const [activeTab, setActiveTab] = useState<SupportedLanguage>(defaultLanguage);

  // Track if slug should be auto-generated
  // In Create mode: Default to true.
  // In Edit mode: Default to false (preserve existing slug), unless user clears it.
  const isSlugAutoRef = useRef<Record<SupportedLanguage, boolean>>({
    en: !isEdit,
    vi: !isEdit,
    ko: !isEdit,
  });

  // Schema with i18n validation messages
  const formSchema = useMemo(() => MarkdownPageCreateSchema.extend({
    coverImage: z.union([z.string(), z.any()]).optional(),
    isDeleted: z.boolean().default(false),
    isTitle: z.boolean().default(false),
    showInMenu: z.boolean().default(false),
    order: z.number().default(0),
    isPublished: z.boolean().default(true),
    translations: z.record(z.string(), z.object({
      title: z.string(), 
      slug: z.string().regex(/^[a-z0-9-]*$/, t('errors.slug_invalid')),
      content: z.string(),
      excerpt: z.string().optional(),
      menuTitle: z.string().optional(),
    })),
  }), [t]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      isTitle: false,
      showInMenu: false,
      parentId: parentId || '', 
      order: 0,
      isPublished: true,
      translations: {
        en: { title: '', slug: '', content: '', excerpt: '', menuTitle: '' },
        vi: { title: '', slug: '', content: '', excerpt: '', menuTitle: '' },
        ko: { title: '', slug: '', content: '', excerpt: '', menuTitle: '' },
      },
      ...initialData,
    },
  });

  // Watch fields for current tab to handle auto-slug
  const currentTitle = useWatch({ control, name: `translations.${activeTab}.title` });
  const currentSlug = useWatch({ control, name: `translations.${activeTab}.slug` });
  
  // Debounce the title for slug generation to avoid "laggy" input
  const debouncedTitle = useDebounce(currentTitle, 500);

  // Auto-generate slug from title
  useEffect(() => {
    if (!open) return;
    
    // If we are in Edit mode, and the flag is false, DO NOT auto-update.
    if (!isSlugAutoRef.current[activeTab]) return;

    const generated = generateSlug(debouncedTitle || '');
    
    if (debouncedTitle) {
      if (currentSlug !== generated) {
        setValue(`translations.${activeTab}.slug`, generated, { shouldValidate: true });
      }
    }
  }, [debouncedTitle, currentSlug, activeTab, open, setValue]);  

  // Fetch parent pages options
  useEffect(() => {
    if (open) {
      void getAllPages().then(pages => {
        if (!Array.isArray(pages)) return;
        
        // Find best title for parent dropdown (prefer EN or VI)
        const getTitle = (p: MarkdownPage) => 
          p.translations['en']?.title || 
          p.translations['vi']?.title || 
          Object.values(p.translations)[0]?.title || 
          p.id;

        const options = pages
          .filter(p => !isEdit || p.id !== initialData.id) // Exclude self
          .map(p => ({
             value: p.id,
             label: getTitle(p)
          }));
        setParentOptions(options);
      });
    }
  }, [open, getAllPages, isEdit, initialData]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setIconPickerOpen(false); // Reset icon picker
      const defaultTrans = { title: '', slug: '', content: '', excerpt: '', menuTitle: '' };
      
      const timer = setTimeout(() => {
        reset({
          isTitle: false,
          showInMenu: false,
          parentId: parentId || undefined,
          order: 0,
          isPublished: true,
          translations: {
            en: { ...defaultTrans, ...initialData?.translations.en },
            vi: { ...defaultTrans, ...initialData?.translations.vi },
            ko: { ...defaultTrans, ...initialData?.translations.ko },
          },
          ...initialData,
        });
      }, 0);
      return () => { clearTimeout(timer); };
    }
  }, [open, initialData, parentId, reset]);

  const handleAutoFill = async () => {
    if (activeTab === defaultLanguage) {
      toast.info(t('toast.already_default'));
      return;
    }

    const translations = getValues('translations');
    const sourceData = translations[defaultLanguage];

    if (!sourceData || !sourceData.title.trim()) {
      toast.warning(t('toast.no_default_content'));
      return;
    }

    setTranslating(true);
    try {
      const translatedFields = await markdownService.translateContent({
        title: sourceData.title,
        slug: sourceData.slug,
        content: sourceData.content,
        excerpt: sourceData.excerpt || '',
        menuTitle: sourceData.menuTitle || '',
        fromLang: defaultLanguage,
        toLang: activeTab,
      });

      // Set translated values
      setValue(`translations.${activeTab}.title`, translatedFields.title, { shouldDirty: true });
      
      // Generate slug from title (consistent with manual title change) and reset auto-flag
      setValue(`translations.${activeTab}.slug`, generateSlug(translatedFields.title), { shouldDirty: true });
      isSlugAutoRef.current[activeTab] = true;

      setValue(`translations.${activeTab}.content`, translatedFields.content, { shouldDirty: true });
      if (translatedFields.excerpt) {
        setValue(`translations.${activeTab}.excerpt`, translatedFields.excerpt, { shouldDirty: true });
      }
      if (translatedFields.menuTitle) {
        setValue(`translations.${activeTab}.menuTitle`, translatedFields.menuTitle, { shouldDirty: true });
      }

      const sourceLabel = LANGUAGES.find(l => l.value === defaultLanguage)?.label;
      const targetLabel = LANGUAGES.find(l => l.value === activeTab)?.label;
      
      toast.success(t('markdown:toast.auto_fill_success', { from: sourceLabel, to: targetLabel }));
    } catch (error) {
      console.error('Translation error:', error);
      toast.error(t('toast.translation_error'));
    } finally {
      setTranslating(false);
    }
  };

  const handleAutoFillAll = async () => {
    const translations = getValues('translations');
    const sourceData = translations[defaultLanguage];

    if (!sourceData || !sourceData.title.trim()) {
      toast.warning(t('toast.no_default_content'));
      return;
    }

    setTranslating(true);
    try {
      const targetLangs = LANGUAGES.filter(l => l.value !== defaultLanguage);
      
      // Use Promise.all to fetch all translations in parallel
      const results = await Promise.all(
        targetLangs.map(async (lang) => {
          const trans = await markdownService.translateContent({
            title: sourceData.title,
            slug: sourceData.slug,
            content: sourceData.content,
            excerpt: sourceData.excerpt || '',
            menuTitle: sourceData.menuTitle || '',
            fromLang: defaultLanguage,
            toLang: lang.value,
          });
          return { lang: lang.value, trans };
        })
      );

      // Batch updates
      results.forEach(({ lang, trans }) => {
        setValue(`translations.${lang}.title`, trans.title, { shouldDirty: true });
        
        setValue(`translations.${lang}.slug`, generateSlug(trans.title), { shouldDirty: true });
        isSlugAutoRef.current[lang] = true;

        setValue(`translations.${lang}.content`, trans.content, { shouldDirty: true });
        if (trans.excerpt) setValue(`translations.${lang}.excerpt`, trans.excerpt, { shouldDirty: true });
        if (trans.menuTitle) setValue(`translations.${lang}.menuTitle`, trans.menuTitle, { shouldDirty: true });
      });

      toast.success(t('markdown:toast.auto_fill_all_success'));
    } catch (error) {
      console.error('Batch translation error:', error);
      toast.error(t('toast.translation_error'));
    } finally {
      setTranslating(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    let success = false;
    const hasFile = data.coverImage instanceof File;
    let payload: MarkdownPageCreateInput | FormData;

    // Validation logic depends on mode
    const validTranslations: Record<string, MarkdownPageTranslation> = {};
    
    if (!manageAllLanguages) {
      // CREATE or EDIT DEFAULT ONLY: Only validate and submit default language
      const defaultTrans = data.translations[defaultLanguage];
      if (defaultTrans && defaultTrans.title.trim() && defaultTrans.slug.trim()) {
        validTranslations[defaultLanguage] = defaultTrans as MarkdownPageTranslation;
      }

      // Fix: Preserve other languages that have content when editing only default language
      Object.entries(data.translations).forEach(([lang, t]) => {
        if (lang !== defaultLanguage && t.title.trim() && t.slug.trim()) {
          validTranslations[lang] = t as MarkdownPageTranslation;
        }
      });
    } else {
      // MANAGE ALL LANGUAGES: Validate all languages (but only submit non-empty ones)
      Object.entries(data.translations).forEach(([lang, t]) => {
        if (t.title.trim() && t.slug.trim()) {
          validTranslations[lang] = t as MarkdownPageTranslation;
        }
      });
    }

    if (Object.keys(validTranslations).length === 0) {
      toast.error(t('errors.at_least_one_language'));
      return;
    }


    // Detect default language
    let detectedDefaultLang: SupportedLanguage;
    
    if (isEdit && initialData.defaultLanguage) {
      // EDIT MODE: ALWAYS keep existing defaultLanguage
      detectedDefaultLang = initialData.defaultLanguage;
    } else if (!isEdit && validTranslations[currentLang]) {
      // CREATE MODE: Use current language if it has content
      detectedDefaultLang = currentLang;
    } else {
      // FALLBACK: Use first language with valid content
      detectedDefaultLang = currentLang;
      for (const lang of LANGUAGES) {
        if (validTranslations[lang.value]) {
          detectedDefaultLang = lang.value;
          break;
        }
      }
    }

    // Update defaultLanguage state
    setDefaultLanguage(detectedDefaultLang);

    // Filtered data
    const finalData = {
      ...data,
      translations: validTranslations,
      defaultLanguage: detectedDefaultLang,
      parentId: data.parentId || undefined,
    };

    if (hasFile) {
      const formData = new FormData();
      Object.entries(finalData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'coverImage' && value instanceof File) {
            formData.append(key, value);
          } else if (key === 'translations') {
             formData.append(key, JSON.stringify(value));
          } else if (typeof value === 'boolean') {
            formData.append(key, value ? 'true' : 'false');
          } else {
            formData.append(key, String(value));
          }
        }
      });
      payload = formData as unknown as MarkdownPageCreateInput;
    } else {
      payload = finalData as unknown as MarkdownPageCreateInput;
    }

    if (isEdit) {
      success = await updatePage(initialData.id, payload);
    } else {
      success = await createPage(payload);
    }

    if (success) {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  return (
    <>
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
          <Button 
            type="button" 
            loading={submitting}
            onClick={() => { 
              void handleSubmit(onSubmit, (errors) => {
                console.error('Validation errors:', errors);
                // Simple error toast
                const keys = Object.keys(errors.translations || {});
                if (keys.length > 0) {
                   toast.error(t('errors.check_tabs', { tabs: keys.join(', ').toUpperCase() }));
                } else {
                   toast.error(t('common:toast.error'));
                }
              })(); 
            }}
          >
            {isEdit ? t('common:actions.save') : t('common:actions.create')}
          </Button>
        </div>
      }
    >
      <form 
        onSubmit={(e) => { e.preventDefault(); void handleSubmit(onSubmit)(); }}
        className="h-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start h-full">
          
          {/* LEFT: Multi-language Content */}
          <div className="lg:col-span-3 space-y-4 pb-6">
            {/* CREATE MODE or EDIT DEFAULT ONLY: Show single language form */}
            {!isEdit || !manageAllLanguages ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm font-medium text-muted">
                    {isEdit 
                      ? `${t('form.editing')}: ${LANGUAGES.find(l => l.value === defaultLanguage)?.label || defaultLanguage}`
                      : `${t('form.default_language')}: ${LANGUAGES.find(l => l.value === defaultLanguage)?.label || defaultLanguage}`
                    }
                  </h3>
                </div>

                {/* Render form for default language only */}
                <div className="space-y-6">
                  {/* Title (Full Width) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t('form.title')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register(`translations.${defaultLanguage}.title`)}
                      placeholder={t('form.title_placeholder')}
                      error={errors.translations?.[defaultLanguage]?.title?.message}
                    />
                  </div>

                  {/* Slug & Excerpt (left) | Cover Image (right) */}
                  <div className="grid grid-cols-3 gap-6">
                    {/* Left column: Slug & Excerpt */}
                    <div className="col-span-2 space-y-4">
                      {/* Slug */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center justify-between">
                          <span>{t('form.slug')} <span className="text-red-500">*</span></span>
                          <span className="text-xs text-muted font-normal">{t('form.slug_help')}</span>
                        </label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <Input
                            {...register(`translations.${defaultLanguage}.slug`)}
                            className="pl-9 pr-10"
                            placeholder={t('form.slug_placeholder')}
                            error={errors.translations?.[defaultLanguage]?.slug?.message}
                            onFocus={() => { isSlugAutoRef.current[defaultLanguage] = false; }}
                            onChange={() => { isSlugAutoRef.current[defaultLanguage] = false; }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-8 w-8 p-0"
                            onClick={() => { 
                              const tVal = getValues(`translations.${defaultLanguage}.title`);
                              setValue(`translations.${defaultLanguage}.slug`, generateSlug(tVal), { shouldValidate: true }); 
                            }}
                            title={t('form.auto_generate_slug')}
                          >
                            <Wand2 className="w-4 h-4 text-primary" />
                          </Button>
                        </div>
                      </div>

                      {/* Excerpt */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('form.excerpt')}</label>
                        <Textarea
                          {...register(`translations.${defaultLanguage}.excerpt`)}
                          placeholder={t('form.excerpt_placeholder')}
                          className="resize-none"
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Right column: Cover Image */}
                    <div className="col-span-1 flex">
                      <div className="space-y-2 flex-1 flex flex-col">
                        <label className="text-sm font-medium">{t('form.cover_image')}</label>
                        <Controller
                          name="coverImage"
                          control={control}
                          render={({ field }) => (
                            <FileUploader
                              value={field.value as File | string | undefined}
                              onChange={field.onChange}
                              preview
                              label={t('form.cover_image')}
                              className="w-full h-full"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('form.content')}</label>
                    <div className="min-h-[400px]">
                      <Controller
                        name={`translations.${defaultLanguage}.content`}
                        control={control}
                        render={({ field }) => (
                          <Suspense fallback={
                            <div className="h-[400px] w-full flex items-center justify-center border rounded-md bg-muted/20">
                              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                          }>
                            <LazyMarkdownEditor
                              value={field.value}
                              onChange={field.onChange}
                              height={400}
                              onImageUpload={uploadImage}
                              onGalleryClick={handleBrowseImage}
                            />
                          </Suspense>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* MANAGE ALL LANGUAGES MODE: Show all language tabs */
              <Tabs value={activeTab} onValueChange={(v: string) => {setActiveTab(v as SupportedLanguage);}} className="w-full">
                <div className="flex items-center justify-between border-b mb-6">
                  <TabsList className="h-auto bg-transparent p-0 rounded-none w-auto justify-start">
                    {LANGUAGES.map(lang => (
                      <TabsTrigger 
                        key={lang.value} 
                        value={lang.value} 
                        className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none flex items-center gap-2"
                      >
                        {lang.label}
                        {lang.value === defaultLanguage && <span className="text-xs opacity-70">({t('common:default')})</span>}
                        {errors.translations?.[lang.value] && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {/* Button Group: Auto-fill Single (Others) OR Auto-fill All (Default) */}
                  {activeTab !== defaultLanguage ? (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { void handleAutoFill(); }}
                      disabled={translating || submitting}
                      loading={translating}
                      title={t('form.auto_fill_tooltip')}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {t('form.auto_fill')}
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { void handleAutoFillAll(); }}
                      disabled={translating || submitting}
                      loading={translating}
                      title={t('form.auto_fill_all_tooltip')}
                      className="text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {t('form.auto_fill_all')}
                    </Button>
                  )}
                </div>

               {LANGUAGES.map(lang => (
                 <TabsContent key={lang.value} value={lang.value} className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    {/* Title (Full Width) */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {t('form.title')} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...register(`translations.${lang.value}.title`)}
                        placeholder={t('form.title_placeholder')}
                        error={errors.translations?.[lang.value]?.title?.message}
                      />
                    </div>

                    {/* Slug & Excerpt (left) | Cover Image (right) */}
                    <div className="grid grid-cols-3 gap-6">
                      {/* Left column: Slug & Excerpt */}
                      <div className="col-span-2 space-y-4">
                        {/* Slug */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center justify-between">
                            <span>{t('form.slug')} <span className="text-red-500">*</span></span>
                            <span className="text-xs text-muted font-normal">{t('form.slug_help')}</span>
                          </label>
                          <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                            <Input
                              {...register(`translations.${lang.value}.slug`)}
                              className="pl-9 pr-10"
                              placeholder={t('form.slug_placeholder')}
                              error={errors.translations?.[lang.value]?.slug?.message}
                              onFocus={() => { isSlugAutoRef.current[lang.value] = false; }}
                              onChange={() => { isSlugAutoRef.current[lang.value] = false; }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1 h-8 w-8 p-0"
                              onClick={() => { 
                                const tVal = getValues(`translations.${lang.value}.title`);
                                setValue(`translations.${lang.value}.slug`, generateSlug(tVal), { shouldValidate: true }); 
                              }}
                              title={t('form.auto_generate_slug')}
                            >
                              <Wand2 className="w-4 h-4 text-primary" />
                            </Button>
                          </div>
                        </div>

                        {/* Excerpt */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{t('form.excerpt')}</label>
                          <Textarea
                            {...register(`translations.${lang.value}.excerpt`)}
                            placeholder={t('form.excerpt_placeholder')}
                            className="resize-none"
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Right column: Cover Image (Shared - editable only in default language) */}
                      <div className="col-span-1 flex">
                        <div className="space-y-2 flex-1 flex flex-col">
                          <label className="text-sm font-medium">
                            {t('form.cover_image')}
                            {lang.value !== defaultLanguage && (
                              <span className="text-xs text-muted ml-2">({t('common:shared')})</span>
                            )}
                          </label>
                          <Controller
                            name="coverImage"
                            control={control}
                            render={({ field }) => (
                              <FileUploader
                                value={field.value as File | string | undefined}
                                onChange={lang.value === defaultLanguage ? field.onChange : undefined}
                                preview
                                label={t('form.cover_image')}
                                className="w-full h-full"
                                disabled={lang.value !== defaultLanguage}
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                   <div className="space-y-2">
                     <label className="text-sm font-medium">{t('form.content')}</label>
                     <div className="min-h-[400px]">
                       <Controller
                         name={`translations.${lang.value}.content`}
                         control={control}
                         render={({ field }) => (
                           <Suspense fallback={
                             <div className="h-[400px] w-full flex items-center justify-center border rounded-md bg-muted/20">
                               <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                             </div>
                           }>
                             <LazyMarkdownEditor
                               value={field.value}
                               onChange={field.onChange}
                               height={400}
                               onImageUpload={uploadImage}
                               onGalleryClick={handleBrowseImage}
                             />
                           </Suspense>
                         )}
                       />
                     </div>
                   </div>

                 </TabsContent>
               ))}
             </Tabs>
            )}
          </div>

          {/* RIGHT: Global Settings */}
          <aside className="lg:sticky lg:top-0 space-y-6 pb-6">
            
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

              {/* Show in Menu */}
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

              {/* Is Title */}
              <div className="flex items-center justify-between border-t pt-3">
                <label className="text-sm cursor-pointer" htmlFor="isTitle">
                  {t('form.is_title')}
                </label>
                <Controller
                  name="isTitle"
                  control={control}
                  render={({ field }) => (
                    <Toggle checked={field.value} onChange={field.onChange} />
                  )}
                />
              </div>

              {/* Parent Page */}
              <div className="flex items-center justify-between border-t pt-3">
                 <label className="text-sm font-medium flex items-center gap-2">
                    <Folder className="w-4 h-4 text-muted" />
                    {t('form.parent_page')}
                 </label>
              </div>
              <Controller
                 name="parentId"
                 control={control}
                 render={({ field }) => (
                    <Select
                       value={field.value || '_none_'}
                       onValueChange={(val) => {
                          field.onChange(val === '_none_' ? '' : val);
                       }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('form.select_parent')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none_">
                             {t('common:none')}
                        </SelectItem>
                         {parentOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                               {option.label}
                            </SelectItem>
                         ))}
                      </SelectContent>
                    </Select>
                 )}
              />


              {/* Order, Menu Title, and Icon */}
               <div className="space-y-3 pt-2 border-t">
                  <div className="space-y-1">
                    <label className="text-xs text-muted">{t('form.order')}</label>
                    <Input
                      type="number"
                      {...register('order', { valueAsNumber: true })}
                    />
                  </div>

                  {/* Menu Title (Per-Language) */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted">{t('form.menu_title')}</label>
                    <Input
                      {...register(manageAllLanguages ? `translations.${activeTab}.menuTitle` : `translations.${defaultLanguage}.menuTitle`)}
                      placeholder={t('form.menu_title_placeholder')}
                    />
                  </div>

                  {/* Icon (Global) */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted">{t('form.icon')}</label>
                    <Controller
                      name="icon"
                      control={control}
                      render={({ field }) => {
                        const SelectedIcon = field.value ? CATEGORY_ICONS[field.value] : null;
                        return (
                          <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-between"
                                    onClick={() => {setIconPickerOpen(!iconPickerOpen); setValue('icon', '')}}
                                  >
                                    <span className="flex items-center gap-2">
                                        {SelectedIcon ? <SelectedIcon className="w-4 h-4" /> : <span className="text-muted-foreground">{t('form.select_icon')}</span>}
                                        {field.value && <span className="text-sm font-normal">{field.value}</span>}
                                    </span>
                                  </Button>
                                  {field.value && (
                                      <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="shrink-0"
                                          onClick={() => {field.onChange(''); setIconPickerOpen(false)}}
                                      >
                                          <X className="w-4 h-4" />
                                      </Button>
                                  )}
                              </div>
                              
                              {iconPickerOpen && (
                                  <div className="border rounded-lg p-2 bg-surface animate-in fade-in slide-in-from-top-2">
                                      <IconPicker 
                                          value={field.value || ''} 
                                          onChange={(val) => {
                                              field.onChange(val);
                                              setIconPickerOpen(false);
                                          }}
                                      />
                                  </div>
                              )}
                          </div>
                        );
                      }}
                    />
                  </div>
               </div>
            </div>

          </aside>
        </div>
      </form>
    </Modal>
    
    <MediaManagerModal 
      open={mediaManagerOpen} 
      onClose={handleMediaClose} 
      onSelect={handleMediaSelect}
      refId={initialData?.id}
      refType="markdown_pages"
    />
    </>
  );
}
