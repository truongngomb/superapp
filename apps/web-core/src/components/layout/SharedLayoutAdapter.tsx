import { useNavigate } from 'react-router-dom';
import { SharedLayoutAdapter as BaseSharedLayoutAdapter } from '@superapp/ui-kit';
import { useAppMenu } from '@/hooks';

export function SharedLayoutAdapter() {
  const navigate = useNavigate();
  const { menuItems } = useAppMenu();

  return (
    <BaseSharedLayoutAdapter 
      menuItems={menuItems} 
      onViewAllNotifications={() => {
        void navigate('/admin/activity-logs');
      }}
    />
  );
}
