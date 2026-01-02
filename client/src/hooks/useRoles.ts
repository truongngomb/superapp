import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { roleService } from '@/services';
import { useToast } from '@/context';
import type { Role, CreateRoleInput } from '@/types';
import { logger } from '@/utils/logger';
import { ApiException } from '@/config';

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const { t } = useTranslation('roles');
  
  // Use ref to avoid infinite loop when reloading
  const isReloading = useRef(false);

  const fetchRoles = useCallback(async () => {
    // Skip if already reloading (prevent loop)
    if (isReloading.current) return;
    
    setLoading(true);
    try {
      const data = await roleService.getAll();
      setRoles(data);
    } catch (error) {
      logger.warn('useRoles', 'Failed to load roles:', error);
      toast.error(t('toast.load_error'));
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  // Silent reload without setting loading state
  const reloadRoles = async () => {
    try {
      isReloading.current = true;
      const data = await roleService.getAll();
      setRoles(data);
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
    loading,
    submitting,
    deleting,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  };
}
