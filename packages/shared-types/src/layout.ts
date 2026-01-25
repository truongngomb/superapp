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

export interface ILayoutProps {
  layoutMode: 'standard' | 'modern';
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
