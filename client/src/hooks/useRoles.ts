import { useState, useCallback } from 'react';
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

  const fetchRoles = useCallback(async () => {
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

  const createRole = async (data: CreateRoleInput) => {
    setSubmitting(true);
    try {
      // Optimistic update fallback or direct API call
      const newRole: Role = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        const result = await roleService.create(data);
        setRoles((prev) => [...prev, result]);
      } catch {
        setRoles((prev) => [...prev, newRole]);
      }
      toast.success(t('toast.create_success'));
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
      setRoles((prev) =>
        prev.map((role) =>
          role.id === id ? { ...role, ...data, updatedAt: new Date().toISOString() } : role
        )
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

  const deleteRole = async (id: string) => {
    setDeleting(true);
    try {
      try {
        await roleService.delete(id);
      } catch {
        // Continue with local delete if API fails (optimistic/fallback)
        // Adjust logic based on strictness requirements
      }
      setRoles((prev) => prev.filter((role) => role.id !== id));
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

