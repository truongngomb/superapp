/**
 * Logger Utility
 * Standardized logging with levels and caller info
 */

import { env } from '@/config';

// ============================================================================
// Types
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  showCaller: boolean;
  showTimestamp: boolean;
}

// ============================================================================
// Configuration
// ============================================================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const config: LoggerConfig = {
  enabled: true,
  minLevel: env.IS_DEV ? 'debug' : 'warn',
  showCaller: env.IS_DEV,
  showTimestamp: true,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get formatted timestamp
 */
function getTimestamp(): string {
  return new Date().toLocaleTimeString();
}

/**
 * Get caller info from stack trace
 */
function getCallerInfo(): string {
  if (!config.showCaller) return '';
  
  const error = new Error();
  const stack = error.stack?.split('\n') || [];
  // Stack: Error -> getCallerInfo -> log method -> caller
  const callerLine = stack[4] || '';
  
  const match = callerLine.match(/\((.*):(\\d+):(\\d+)\)/) ||
                callerLine.match(/at\\s+(.*):(\\d+):(\\d+)/);
  
  if (match) {
    return `@ ${match[1] ?? ''}:${match[2] ?? ''}`;
  }
  return '';
}

/**
 * Check if log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  return config.enabled && LOG_LEVELS[level] >= LOG_LEVELS[config.minLevel];
}

/**
 * Format log prefix
 */
function formatPrefix(level: LogLevel, context: string): string {
  const parts: string[] = [];
  
  if (config.showTimestamp) {
    parts.push(`[${getTimestamp()}]`);
  }
  
  parts.push(`[${level.toUpperCase()}]`);
  parts.push(`[${context}]`);
  
  return parts.join(' ');
}

// ============================================================================
// Logger Object
// ============================================================================

/**
 * Standardized logger utility
 * Usage: logger.info('ModuleName', 'Message', data);
 */
export const logger = {
  /**
   * Debug level - only shown in development
   */
  debug(context: string, message: string, ...args: unknown[]): void {
    if (!shouldLog('debug')) return;
    
    const prefix = formatPrefix('debug', context);
    const caller = getCallerInfo();
    console.debug(prefix, message, ...args, caller);
  },

  /**
   * Info level - general information
   */
  info(context: string, message: string, ...args: unknown[]): void {
    if (!shouldLog('info')) return;
    
    const prefix = formatPrefix('info', context);
    const caller = getCallerInfo();
    console.log(prefix, message, ...args, caller);
  },

  /**
   * Warning level - potential issues
   */
  warn(context: string, message: string, ...args: unknown[]): void {
    if (!shouldLog('warn')) return;
    
    const prefix = formatPrefix('warn', context);
    const caller = getCallerInfo();
    console.warn(prefix, message, ...args, caller);
  },

  /**
   * Error level - errors and exceptions
   */
  error(context: string, message: string, ...args: unknown[]): void {
    if (!shouldLog('error')) return;
    
    const prefix = formatPrefix('error', context);
    const caller = getCallerInfo();
    console.error(prefix, message, ...args, caller);
  },

  /**
   * Configure logger settings
   */
  configure(newConfig: Partial<LoggerConfig>): void {
    Object.assign(config, newConfig);
  },

  /**
   * Temporarily disable logging
   */
  disable(): void {
    config.enabled = false;
  },

  /**
   * Re-enable logging
   */
  enable(): void {
    config.enabled = true;
  },
};
