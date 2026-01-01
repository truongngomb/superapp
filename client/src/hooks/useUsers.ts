import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { userService, type User, type PaginatedUsers, type UserListParams } from '@/services/user.service';
import { useToast } from '@/context';
import { logger } from '@/utils/logger';
import { ApiException } from '@/config';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const { t } = useTranslation('users');

  const fetchUsers = useCallback(async (params?: UserListParams) => {
    setLoading(true);
    try {
      const data: PaginatedUsers = await userService.getUsers(params);
      setUsers(data.items);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
      });
    } catch (error) {
      logger.warn('useUsers', 'Failed to load users:', error);
      toast.error(t('toast.load_error'));
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  const updateUser = async (id: string, data: { name?: string; isActive?: boolean }) => {
    setSubmitting(true);
    try {
      const updated = await userService.updateUser(id, data);
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, ...updated } : user))
      );
      toast.success(t('toast.update_success'));
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteUser = async (id: string) => {
    setDeleting(true);
    try {
      await userService.deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      toast.success(t('toast.delete_success'));
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('toast.error');
      toast.error(message);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  const assignRole = async (userId: string, roleId: string) => {
    setSubmitting(true);
    try {
      const updated = await userService.assignRole(userId, roleId);
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role: updated.role, roleName: updated.roleName } : user))
      );
      toast.success(t('toast.assign_role_success'));
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const removeRole = async (userId: string) => {
    setSubmitting(true);
    try {
      await userService.removeRole(userId);
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role: undefined, roleName: undefined } : user))
      );
      toast.success(t('toast.remove_role_success'));
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    users,
    pagination,
    loading,
    submitting,
    deleting,
    fetchUsers,
    updateUser,
    deleteUser,
    assignRole,
    removeRole,
  };
}
