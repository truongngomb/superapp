import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { userService } from '@/services/user.service';
import type { User, PaginatedUsers, UserListParams } from '@/types';
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
  
  // Use refs to avoid infinite loop when reloading
  const isReloading = useRef(false);
  const lastParamsRef = useRef<UserListParams | undefined>(undefined);

  const fetchUsers = useCallback(async (params?: UserListParams) => {
    // Skip if already reloading (prevent loop)
    if (isReloading.current) return;
    
    setLoading(true);
    // Save params for reload
    if (params !== undefined) {
      lastParamsRef.current = params;
    }
    try {
      const data: PaginatedUsers = await userService.getUsers(params ?? lastParamsRef.current);
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

  // Silent reload without setting loading state
  const reloadUsers = async () => {
    try {
      isReloading.current = true;
      const data: PaginatedUsers = await userService.getUsers(lastParamsRef.current);
      setUsers(data.items);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
      });
    } catch (error) {
      logger.warn('useUsers', 'Failed to reload users:', error);
    } finally {
      isReloading.current = false;
    }
  };

  const updateUser = async (id: string, data: { name?: string; isActive?: boolean }) => {
    setSubmitting(true);
    try {
      await userService.updateUser(id, data);
      toast.success(t('toast.update_success'));
      // Reload list after update
      await reloadUsers();
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
      toast.success(t('toast.delete_success'));
      // Reload list after delete
      await reloadUsers();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('toast.error');
      toast.error(message);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  /**
   * Assign roles to user (replaces all existing roles)
   */
  const assignRoles = async (userId: string, roleIds: string[]) => {
    setSubmitting(true);
    try {
      await userService.assignRoles(userId, roleIds);
      toast.success(t('toast.assign_roles_success'));
      // Reload list after assign roles
      await reloadUsers();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Add a single role to user
   */
  const addRole = async (userId: string, roleId: string) => {
    setSubmitting(true);
    try {
      await userService.addRole(userId, roleId);
      toast.success(t('toast.assign_role_success'));
      // Reload list after add role
      await reloadUsers();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Remove a specific role from user
   */
  const removeRole = async (userId: string, roleId: string) => {
    setSubmitting(true);
    try {
      await userService.removeRole(userId, roleId);
      toast.success(t('toast.remove_role_success'));
      // Reload list after remove role
      await reloadUsers();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Remove all roles from user
   */
  const removeAllRoles = async (userId: string) => {
    setSubmitting(true);
    try {
      await userService.removeAllRoles(userId);
      toast.success(t('toast.remove_role_success'));
      // Reload list after remove all roles
      await reloadUsers();
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
    assignRoles,
    addRole,
    removeRole,
    removeAllRoles,
  };
}
