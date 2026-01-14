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
