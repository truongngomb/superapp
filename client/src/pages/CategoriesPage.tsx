import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FixedSizeList as List } from 'react-window';
import { Plus, Edit2, Trash2, Folder, Search, RefreshCw } from 'lucide-react';
import { Button, Card, CardContent, Input, LoadingSpinner, Toast } from '@/components/common';
import { api, ApiException } from '@/config';
import type { Category, CategoryInput } from '@/types';
import { cn } from '@/utils';

// Category item for virtualized list
interface CategoryRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    categories: Category[];
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
  };
}

function CategoryRow({ index, style, data }: CategoryRowProps) {
  const category = data.categories[index];
  if (!category) return null;

  return (
    <div style={style} className="px-1 py-1">
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card p-4 flex items-center gap-4"
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: category.color + '20' }}
        >
          <Folder className="w-5 h-5" style={{ color: category.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{category.name}</h3>
          <p className="text-sm text-muted truncate">{category.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => data.onEdit(category)}
            aria-label="Sửa"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => data.onDelete(category.id)}
            aria-label="Xóa"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// Category form modal
interface CategoryFormProps {
  category: Category | null;
  onSubmit: (data: CategoryInput) => void;
  onClose: () => void;
  loading: boolean;
}

function CategoryForm({ category, onSubmit, onClose, loading }: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryInput>({
    name: category?.name ?? '',
    description: category?.description ?? '',
    color: category?.color ?? '#3b82f6',
    icon: category?.icon ?? 'folder',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">
              {category ? 'Sửa danh mục' : 'Thêm danh mục mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Tên danh mục"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên danh mục"
                required
              />
              <Input
                label="Mô tả"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Màu sắc</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Hủy
                </Button>
                <Button type="submit" loading={loading} className="flex-1">
                  {category ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Category[]>('/categories');
      setCategories(data);
    } catch (error) {
      // Use mock data if API is not available
      setCategories([
        { id: '1', name: 'Công nghệ', description: 'Các sản phẩm công nghệ', color: '#3b82f6', icon: 'folder', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '2', name: 'Thời trang', description: 'Quần áo và phụ kiện', color: '#ec4899', icon: 'folder', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '3', name: 'Thực phẩm', description: 'Đồ ăn và thức uống', color: '#22c55e', icon: 'folder', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '4', name: 'Sức khỏe', description: 'Sản phẩm chăm sóc sức khỏe', color: '#f59e0b', icon: 'folder', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ]);
      console.log('Using mock data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  // Filter categories by search query
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form submit
  const handleSubmit = async (data: CategoryInput) => {
    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, data);
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingCategory.id ? { ...cat, ...data, updatedAt: new Date().toISOString() } : cat
          )
        );
        setToast({ message: 'Cập nhật danh mục thành công!', type: 'success' });
      } else {
        const newCategory: Category = {
          id: crypto.randomUUID(),
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        // Try API first, fallback to local state
        try {
          const result = await api.post<Category>('/categories', data);
          setCategories((prev) => [...prev, result]);
        } catch {
          setCategories((prev) => [...prev, newCategory]);
        }
        setToast({ message: 'Thêm danh mục thành công!', type: 'success' });
      }
      setShowForm(false);
      setEditingCategory(null);
    } catch (error) {
      const message = error instanceof ApiException ? error.message : 'Có lỗi xảy ra';
      setToast({ message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    
    try {
      await api.delete(`/categories/${id}`);
    } catch {
      // Continue with local delete
    }
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    setToast({ message: 'Xóa danh mục thành công!', type: 'success' });
  };

  // Open edit form
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Quản lý Danh mục</h1>
          <p className="text-muted mt-1">Quản lý các danh mục sản phẩm</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-5 h-5" />
          Thêm mới
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm danh mục..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => void fetchCategories()}>
          <RefreshCw className={cn('w-5 h-5', loading && 'animate-spin')} />
        </Button>
      </div>

      {/* Categories list */}
      {loading ? (
        <LoadingSpinner size="lg" text="Đang tải danh mục..." className="py-20" />
      ) : filteredCategories.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Folder className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">
              {searchQuery ? 'Không tìm thấy danh mục phù hợp' : 'Chưa có danh mục nào'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowForm(true)} className="mt-4">
                Thêm danh mục đầu tiên
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="h-[500px]">
          <List
            height={500}
            itemCount={filteredCategories.length}
            itemSize={88}
            width="100%"
            itemData={{
              categories: filteredCategories,
              onEdit: handleEdit,
              onDelete: handleDelete,
            }}
          >
            {CategoryRow}
          </List>
        </div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <CategoryForm
            category={editingCategory}
            onSubmit={handleSubmit}
            onClose={() => {
              setShowForm(false);
              setEditingCategory(null);
            }}
            loading={submitting}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <Toast
        message={toast?.message ?? ''}
        type={toast?.type}
        visible={!!toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
