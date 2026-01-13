import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { userService } from '@/services/user.service';
import type { User, UserCreateInput, UserUpdateInput, UserListParams } from '@/types';
import { useToast } from '@/context';
import { logger } from '@/utils/logger';
import { ApiException } from '@/config';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const toast = useToast();
  const { t } = useTranslation(['users', 'common']);
  
  // Use refs to avoid infinite loop when reloading
  const isReloading = useRef(false);
  const lastParamsRef = useRef<UserListParams | undefined>(undefined);

  const fetchUsers = useCallback(async (params?: UserListParams) => {
    // Skip if already reloading (prevent loop)
    if (isReloading.current) return;

    // Determine if this is a page change (loadingMore) or initial/filter change
    const isPageChange = params?.page !== undefined && 
      params.page !== 1 && 
      lastParamsRef.current?.page !== params.page;
    
    // Save params for reload
    if (params !== undefined) {
      lastParamsRef.current = { ...lastParamsRef.current, ...params };
    }

    // Set appropriate loading state
    if (isPageChange) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await userService.getPage(lastParamsRef.current);
      setUsers(data.items);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
      });
    } catch (error) {
      logger.warn('useUsers', 'Failed to load users:', error);
      toast.error(t('common:toast.load_error'));
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [toast, t]);

  // Silent reload without setting loading state
  const reloadUsers = async () => {
    try {
      isReloading.current = true;
      const data = await userService.getPage(lastParamsRef.current);
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

  const createUser = async (data: UserCreateInput) => {
    setSubmitting(true);
    try {
      await userService.create(data);
      toast.success(t('common:toast.create_success'));
      await reloadUsers();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const updateUser = async (id: string, data: UserUpdateInput) => {
    setSubmitting(true);
    try {
      await userService.updateUser(id, data);
      toast.success(t('common:toast.update_success'));
      await reloadUsers();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const restoreUser = async (id: string) => {
    setSubmitting(true);
    try {
      await userService.restoreUser(id);
      toast.success(t('common:toast.restore_success'));
      await reloadUsers();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
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
      toast.success(t('common:toast.delete_success'));
      await reloadUsers();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
      toast.error(message);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  const deleteUsers = async (ids: string[]) => {
    setBatchDeleting(true);
    try {
      await userService.deleteMany(ids);
      toast.success(t('common:toast.batch_delete_success', { count: ids.length }));
      await reloadUsers();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
      toast.error(message);
      return false;
    } finally {
      setBatchDeleting(false);
    }
  };

  const restoreUsers = async (ids: string[]) => {
    setSubmitting(true);
    try {
      await userService.restoreMany(ids);
      toast.success(t('common:toast.batch_restore_success', { count: ids.length }));
      await reloadUsers();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const updateUsersStatus = async (ids: string[], isActive: boolean) => {
    setSubmitting(true);
    try {
      await userService.batchUpdateStatus(ids, isActive);
      toast.success(t('common:toast.batch_status_success', { count: ids.length }));
      await reloadUsers();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const getAllForExport = async (params?: Omit<UserListParams, 'page' | 'limit'>) => {
    setExporting(true);
    try {
      return await userService.getAllForExport(params);
    } catch (error) {
      logger.warn('useUsers', 'Failed to export users:', error);
      toast.error(t('common:toast.load_error'));
      return [];
    } finally {
      setExporting(false);
    }
  };

  /**
   * Assign roles to user
   */
  const assignRoles = async (userId: string, roleIds: string[]) => {
    setSubmitting(true);
    try {
      await userService.assignRoles(userId, roleIds);
      toast.success(t('common:toast.action_success', { defaultValue: 'Roles assigned successfully' }));
      await reloadUsers();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
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
    isLoadingMore,
    submitting,
    deleting,
    batchDeleting,
    exporting,
    fetchUsers,
    createUser,
    updateUser,
    restoreUser,
    deleteUser,
    deleteUsers,
    restoreUsers,
    updateUsersStatus,
    getAllForExport,
    assignRoles,
  };
}
