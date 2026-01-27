import { SharedLayoutAdapter as BaseSharedLayoutAdapter } from '@superapp/ui-kit';
import { useAppMenu } from '@/hooks';

export function SharedLayoutAdapter() {
  const { menuItems } = useAppMenu();

  return (
    <BaseSharedLayoutAdapter 
      menuItems={menuItems}
    />
  );
}
