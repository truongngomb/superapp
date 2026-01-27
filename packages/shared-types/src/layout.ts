export interface IMenuItem {
  path: string;
  label: string;
  icon?: unknown; // Use unknown instead of any to force casting in UI
  permission?: {
    resource: string;
    action: string;
  };
  isTitle?: boolean;
  children?: IMenuItem[];
  matchPrefix?: boolean;
}

export type LayoutMode = 'standard' | 'modern';
export type ViewMode = 'list' | 'table';

export interface ILayoutProps {
  layoutMode: LayoutMode;
}

export interface ISidebarProps {
  open?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
  items: IMenuItem[];
  currentPath: string;
  renderItemWrapper?: (item: IMenuItem, children: unknown) => unknown;
  t?: (key: string, options?: Record<string, unknown>) => string;
}

export interface IHeaderProps {
  user?: {
      name?: string;
      email?: string;
      avatar?: string;
      role?: string;
  }; 
  onLogout?: () => void;
  onMenuToggle?: () => void;
  menuOpen?: boolean;
  breadcrumbs?: { label: string; path?: string }[];
}

// ============================================================================
// System Settings Types
// ============================================================================

/**
 * Resource Group for organizing role resources
 * Used in Role Settings to group resources by category (e.g., "Web Core", "Story Weaver")
 */
export interface ResourceGroup {
  /** Unique identifier for the group */
  id: string;
  /** Display name of the group */
  name: string;
  /** List of resource identifiers in this group */
  resources: string[];
  /** Sort order (lower = higher priority) */
  order: number;
}

/**
 * Layout path configuration with wildcard support
 * Supports:
 * - Exact match: "/categories"
 * - Single-level wildcard: "story-weaver/*" (matches /story-weaver/projects but not /story-weaver/editor/scene)
 * - Recursive wildcard: "story-weaver/**" (matches all nested paths)
 */
export interface LayoutPathConfig {
  /** 
   * Path pattern to match
   * - Exact: "/categories"
   * - Single wildcard: "story-weaver/*"
   * - Recursive wildcard: "story-weaver/**"
   */
  pattern: string;
  /** Layout mode to apply when matched */
  mode: LayoutMode | 'default';
  /** Priority for matching (higher = more priority when multiple patterns match) */
  priority: number;
}

/**
 * New layout configuration format with wildcard path support
 */
export interface LayoutConfig {
  /** Global default layout mode */
  global: LayoutMode;
  /** Path-specific layout configurations */
  paths: LayoutPathConfig[];
}

/**
 * Legacy layout configuration format (for migration support)
 * @deprecated Use LayoutConfig instead
 */
export interface LegacyLayoutConfig {
  /** Global default layout mode */
  global: string;
  /** Simple page-to-mode mapping without wildcards */
  pages: Record<string, string>;
}

/**
 * Union type for role resources data
 * Supports both legacy (flat list) and new (grouped) formats
 */
export type RoleResourcesData = string[] | ResourceGroup[];

/**
 * Type guard to check if data is in legacy format (flat list)
 */
export function isLegacyRoleResources(data: RoleResourcesData): data is string[] {
  return Array.isArray(data) && (data.length === 0 || typeof data[0] === 'string');
}

/**
 * Type guard to check if data is in grouped format
 */
export function isGroupedRoleResources(data: RoleResourcesData): data is ResourceGroup[] {
  return Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && 'resources' in data[0];
}

/**
 * Type guard to check if layout config is in legacy format
 * Note: This function intentionally uses LegacyLayoutConfig for migration support
 */
export function isLegacyLayoutConfig(
  config: LayoutConfig
): config is LayoutConfig {
  return 'pages' in config && !('paths' in config);
}
