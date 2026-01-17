# Component Patterns

> Patterns và conventions cho React components trong SuperApp

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Page | `{Feature}Page.tsx` | `CategoriesPage.tsx` |
| Form | `{Feature}Form.tsx` | `CategoryForm.tsx` |
| Table | `{Feature}Table.tsx` | `CategoryTable.tsx` |
| Row/Card | `{Feature}Row.tsx` | `CategoryRow.tsx` |
| Skeleton | `{Feature}Skeleton.tsx` | `CategorySkeleton.tsx` |
| **Mobile Card** | `{Feature}MobileCard.tsx` | `CategoryMobileCard.tsx` |
| **Mobile Skeleton** | `{Feature}MobileCardSkeleton.tsx` | `CategoryMobileCardSkeleton.tsx` |
| **Mobile List** | `{Feature}MobileList.tsx` | `CategoryMobileList.tsx` |
| Hook | `use{Feature}.ts` | `useCategories.ts` |
| Service | `{feature}.service.ts` | `category.service.ts` |

## Page Component Pattern

```tsx
export default function CategoriesPage() {
  // 1. Hooks
  const { t } = useTranslation(['categories', 'common']);
  const { categories, loading, fetchCategories, ... } = useCategories();
  const { checkPermission } = useAuth();
  
  // 2. State
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // 3. Permissions
  const canCreate = checkPermission('categories', 'create');
  const canUpdate = checkPermission('categories', 'update');
  const canDelete = checkPermission('categories', 'delete');
  
  // 4. Effects
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  // 5. Handlers
  const handleCreate = async (data) => { ... };
  const handleExport = async () => { ... };
  
  // 6. Render
  return (
    <div className="space-y-6">
      <PageHeader ... />
      <ResourceToolbar ... />
      {loading ? <Skeleton /> : <Table />}
      <Pagination ... />
      <FormModal ... />
    </div>
  );
}
```

## Form Component Pattern

```tsx
interface CategoryFormProps {
  initialData?: Category;
  onSubmit: (data: CreateCategoryInput) => Promise<boolean>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CategoryForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  isSubmitting 
}: CategoryFormProps) {
  const { t } = useTranslation(['categories', 'common']);
  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    color: initialData?.color ?? '#3B82F6',
    icon: initialData?.icon ?? 'Folder',
  });
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    if (success) onCancel();
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Input label={t('categories:form.name')} ... />
      <ColorPicker ... />
      <IconPicker ... />
      <div className="flex gap-2">
        <Button type="button" onClick={onCancel}>
          {t('common:cancel')}
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {t('common:save')}
        </Button>
      </div>
    </form>
  );
}
```

## Table Component Pattern

```tsx
export function CategoryTable({
  items,
  selectedIds,
  onSelect,
  onEdit,
  onDelete,
  onRestore,
  sortConfig,
  onSort,
  canUpdate,
  canDelete,
}: CategoryTableProps) {
  const { t } = useTranslation(['categories', 'common']);
  
  const columns: Column<Category>[] = useMemo(() => [
    {
      key: 'select',
      header: <Checkbox checked={allSelected} onChange={toggleAll} />,
      render: (item) => <Checkbox checked={selectedIds.includes(item.id)} />,
    },
    {
      key: 'name',
      header: t('common:name'),
      sortable: true,
      render: (item) => item.name,
    },
    // ... more columns
  ], [t, selectedIds]);
  
  return (
    <DataTable
      columns={columns}
      data={items}
      sortConfig={sortConfig}
      onSort={onSort}
    />
  );
}
```

## i18n Pattern

```tsx
// Entity interpolation
t('common:toast.create_success', { entity: t('categories:entity') })
// → "Category created successfully!"

t('common:list.empty', { entities: t('categories:entities') })
// → "No categories found"

t('common:batch_confirmation.delete', { 
  count: ids.length, 
  entities: t('categories:entities') 
})
// → "Are you sure you want to move 5 categories to Trash?"
```

## Dark/Light Theme

```tsx
// ✅ Correct - uses theme tokens
<div className="bg-surface text-foreground border-border">

// ❌ Wrong - hardcoded colors
<div className="bg-white text-gray-900 border-gray-200">
```

## Permission Guard

```tsx
// In JSX
{canCreate && (
  <Button onClick={() => setIsFormOpen(true)}>
    {t('common:add')}
  </Button>
)}

// Route level
<ProtectedRoute resource="categories" action="view">
  <CategoriesPage />
</ProtectedRoute>
```

## Mobile Card Component Pattern

```tsx
interface FeatureMobileCardProps {
  item: Feature;
  index?: number;
  onEdit: (item: Feature) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  onDuplicate?: (item: Feature) => void;
  isSelected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

export function FeatureMobileCard({
  item,
  index = 0,
  onEdit,
  onDelete,
  ...
}: FeatureMobileCardProps) {
  return (
    <motion.div className="card border shadow-xl">
      {/* Header: Icon + Order + Name + Status Icon */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          {onSelect && <Checkbox ... />}
          <div className="w-12 h-12 rounded-full">
            <IconComponent />
          </div>
          <div className="flex-1">
            <span>#{index + 1}</span>
            <h3>{item.name}</h3>
          </div>
          <StatusIcon />
        </div>
      </div>
      
      {/* Info Rows (optional) */}
      <div className="mx-4 mb-4">
        <InfoRow icon={Icon} label="Label" value={value} />
      </div>
      
      {/* Bottom Actions */}
      <div className="flex border-t">
        <ActionButton icon={Edit2} onClick={onEdit} />
        <ActionButton icon={Trash2} onClick={onDelete} />
      </div>
    </motion.div>
  );
}
```

## Mobile List with Infinite Scroll Pattern

```tsx
export function FeatureMobileList({
  items,
  selectedIds,
  onSelect,
  onEdit,
  onDelete,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: FeatureMobileListProps) {
  // IntersectionObserver for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="grid gap-4">
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <FeatureMobileCard key={item.id} item={item} index={index} ... />
        ))}
      </AnimatePresence>
      
      {/* Infinite Scroll Trigger */}
      <div ref={loadMoreRef}>
        {isFetchingNextPage && <Skeleton />}
        {!hasNextPage && items.length > 0 && (
          <p>{t('common:list.end_of_list')}</p>
        )}
      </div>
    </div>
  );
}
```

## Responsive Page Pattern

```tsx
export default function FeaturePage() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => 
    getStorageItem(STORAGE_KEYS.VIEW_MODE, 'table')
  );
  
  // Auto-detect mobile and get effective view
  const { effectiveView, isMobile } = useResponsiveView(viewMode);
  
  // Infinite scroll for mobile
  const { allItems, hasNextPage, fetchNextPage, isFetchingNextPage } = 
    useInfiniteResource({ resourceHook, pageSize: 20 });

  return (
    <div>
      {/* Toolbar - pass isMobile to hide ViewSwitcher on mobile */}
      <ResourceToolbar 
        isMobile={isMobile} 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        ...
      />
      
      {/* Conditional rendering based on effectiveView */}
      {effectiveView === 'mobile' ? (
        <FeatureMobileList
          items={allItems}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
          ...
        />
      ) : effectiveView === 'table' ? (
        <>
          <DataTable ... />
          <Pagination ... />
        </>
      ) : (
        <>
          <FeatureRow ... />
          <Pagination ... />
        </>
      )}
    </div>
  );
}
```

## Batch Action Buttons Pattern

```tsx
<BatchActionButtons
  resource="features"
  selectedCount={selectedIds.length}
  showArchived={showArchived}
  hasDeletedSelected={hasDeletedSelected}
  onRestore={() => { ... }}
  onDelete={() => { ... }}
  onActivate={() => { ... }}
  onDeactivate={() => { ... }}
/>

// Colors:
// - Delete: text-red-500 (danger)
// - Activate: text-emerald-500 (success)
// - Deactivate: text-amber-500 (warning)
// - On mobile: icon-only (hidden sm:inline for text)
```
