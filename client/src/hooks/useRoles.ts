import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { roleService } from '@/services';
import { useToast } from '@/context';
import type { Role, CreateRoleInput, RoleListParams } from '@/types';
import { logger } from '@/utils/logger';
import { ApiException } from '@/config';

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const { t } = useTranslation('roles');
  
  // Pagination state
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const lastParamsRef = useRef<RoleListParams | undefined>(undefined);

  // Use ref to avoid infinite loop when reloading
  const isReloading = useRef(false);

  const fetchRoles = useCallback(async (params?: RoleListParams) => {
    // Determine if this is a page change (loadingMore) or initial/filter change
    const isPageChange = params?.page !== undefined && 
      params.page !== 1 && 
      lastParamsRef.current?.page !== params.page;

    // Update last params
    if (params !== undefined) {
      lastParamsRef.current = { ...lastParamsRef.current, ...params };
    }

    // Skip if already reloading (prevent loop)
    if (isReloading.current) return;
    
    // Set appropriate loading state
    if (isPageChange) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await roleService.getPage(lastParamsRef.current);
      setRoles(data.items);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total
      });
    } catch (error) {
      logger.warn('useRoles', 'Failed to load roles:', error);
      toast.error(t('toast.load_error'));
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [toast, t]);

  // Silent reload without setting loading state
  const reloadRoles = async () => {
    try {
      isReloading.current = true;
      const data = await roleService.getPage(lastParamsRef.current);
      setRoles(data.items);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total
      });
    } catch (error) {
      logger.warn('useRoles', 'Failed to reload roles:', error);
    } finally {
      isReloading.current = false;
    }
  };

  const createRole = async (data: CreateRoleInput) => {
    setSubmitting(true);
    try {
      await roleService.create(data);
      toast.success(t('toast.create_success'));
      // Reload list after create
      await reloadRoles();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const updateRole = async (id: string, data: CreateRoleInput) => {
    setSubmitting(true);
    try {
      await roleService.update(id, data);
      toast.success(t('toast.update_success'));
      // Reload list after update
      await reloadRoles();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteRole = async (id: string) => {
    setDeleting(true);
    try {
      await roleService.delete(id);
      toast.success(t('toast.delete_success'));
      // Reload list after delete
      await reloadRoles();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('toast.error');
      toast.error(message);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return {
    roles,
    pagination,
    loading,
    isLoadingMore,
    submitting,
    deleting,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  };
}

