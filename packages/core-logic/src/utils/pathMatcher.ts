/**
 * Path Matcher Utility
 * Matches URL paths against patterns with wildcard support
 */

import type { LayoutPathConfig, LayoutMode } from '@superapp/shared-types';

/**
 * Check if a path matches a pattern
 * 
 * Supports:
 * - Exact match: "/categories" matches only "/categories"
 * - Single-level wildcard (*): "story-weaver/*" matches "/story-weaver/projects" but not "/story-weaver/editor/scene"
 * - Recursive wildcard (**): "story-weaver/**" matches all nested paths
 * 
 * @param path - The current URL path to check
 * @param pattern - The pattern to match against
 * @returns true if the path matches the pattern
 */
export function matchPath(path: string, pattern: string): boolean {
  // Normalize paths: remove leading/trailing slashes for consistent comparison
  const normalizedPath = path.replace(/^\/+|\/+$/g, '');
  const normalizedPattern = pattern.replace(/^\/+|\/+$/g, '');

  // Exact match
  if (normalizedPattern === normalizedPath) {
    return true;
  }

  // Check for wildcard patterns
  if (normalizedPattern.includes('*')) {
    // Recursive wildcard: **
    if (normalizedPattern.endsWith('/**')) {
      const prefix = normalizedPattern.slice(0, -3); // Remove /**
      return normalizedPath === prefix || normalizedPath.startsWith(prefix + '/');
    }

    // Single-level wildcard: *
    if (normalizedPattern.endsWith('/*')) {
      const prefix = normalizedPattern.slice(0, -2); // Remove /*
      const remaining = normalizedPath.slice(prefix.length + 1); // Get part after prefix/
      
      // Must start with prefix and have exactly one more segment
      if (normalizedPath.startsWith(prefix + '/')) {
        // Check that remaining part has no slashes (single level)
        return !remaining.includes('/');
      }
      return false;
    }

    // Pattern with * in the middle (e.g., "admin/*/edit")
    const regexPattern = normalizedPattern
      .replace(/\*\*/g, '<<<RECURSIVE>>>')
      .replace(/\*/g, '[^/]+')
      .replace(/<<<RECURSIVE>>>/g, '.*');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(normalizedPath);
  }

  return false;
}

/**
 * Find the best matching layout configuration for a given path
 * 
 * Priority order:
 * 1. Exact match (highest priority, regardless of priority number)
 * 2. Pattern matches sorted by priority (higher = more priority)
 * 3. Global default (fallback)
 * 
 * @param currentPath - The current URL path
 * @param configs - Array of layout path configurations
 * @param globalMode - The global default layout mode
 * @returns The layout mode to use
 */
export function matchLayoutPath(
  currentPath: string,
  configs: LayoutPathConfig[],
  globalMode: LayoutMode = 'standard'
): LayoutMode {
  if (configs.length === 0) {
    return globalMode;
  }

  // Normalize the current path
  const normalizedPath = currentPath.replace(/^\/+|\/+$/g, '');

  // First, check for exact matches (highest priority)
  const exactMatch = configs.find(config => {
    const normalizedPattern = config.pattern.replace(/^\/+|\/+$/g, '');
    return normalizedPattern === normalizedPath && config.mode !== 'default';
  });

  if (exactMatch) {
    return exactMatch.mode as LayoutMode;
  }

  // Second, find all wildcard matches and sort by priority (descending)
  const wildcardMatches = configs
    .filter(config => {
      if (config.mode === 'default') return false;
      const normalizedPattern = config.pattern.replace(/^\/+|\/+$/g, '');
      return normalizedPattern.includes('*') && matchPath(currentPath, config.pattern);
    })
    .sort((a, b) => b.priority - a.priority);

  if (wildcardMatches.length > 0) {
    return wildcardMatches[0].mode as LayoutMode;
  }

  // Fallback to global mode
  return globalMode;
}

/**
 * Migrate legacy layout config to new format
 * 
 * @param legacyConfig - Legacy config with pages: Record<string, string>
 * @returns New config format with paths: LayoutPathConfig[]
 */
export function migrateLegacyLayoutConfig(legacyConfig: {
  global: string;
  pages: Record<string, string>;
}): { global: LayoutMode; paths: LayoutPathConfig[] } {
  const paths: LayoutPathConfig[] = Object.entries(legacyConfig.pages).map(
    ([pattern, mode], index) => ({
      pattern,
      mode: mode as LayoutMode | 'default',
      priority: 100 - index, // Earlier entries get higher priority
    })
  );

  const globalMode: LayoutMode = legacyConfig.global as LayoutMode;
  
  return {
    global: globalMode,
    paths,
  };
}

/**
 * Migrate legacy role resources (flat list) to grouped format
 * 
 * @param resources - Flat list of resource names
 * @param defaultGroupName - Name for the default group
 * @returns Array with a single group containing all resources
 */
export function migrateLegacyRoleResources(
  resources: string[],
  defaultGroupName: string = 'Default'
): { id: string; name: string; resources: string[]; order: number }[] {
  return [
    {
      id: 'default',
      name: defaultGroupName,
      resources: [...resources],
      order: 0,
    },
  ];
}
