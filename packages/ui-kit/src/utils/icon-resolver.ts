import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { CATEGORY_ICONS } from '../components/icons';

/**
 * Resolves an icon name to a LucideIcon component.
 * 1. Checks CATEGORY_ICONS map.
 * 2. Checks direct Lucide lookup (case-sensitive).
 * 3. Tries PascalCase fallback.
 */
export function resolveIcon(iconName?: string | null): LucideIcon | undefined {
  if (!iconName) return undefined;
  
  // 1. Try CATEGORY_ICONS (prioritize picker keys)
  const categoryIcon = (CATEGORY_ICONS as Record<string, LucideIcon | undefined>)[iconName];
  if (categoryIcon) {
    return categoryIcon;
  }
  
  // 2. Try direct Lucide lookup (case-sensitive)
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  if (iconName in icons) {
    return icons[iconName];
  }
  
  // 3. Try PascalCase fallback (e.g. "shopping_bag" -> "ShoppingBag")
  const pascalName = iconName
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
  
  if (pascalName in icons) {
    return icons[pascalName];
  }

  return undefined;
}
