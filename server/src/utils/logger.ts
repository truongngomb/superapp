/**
 * Logger Utility
 * 
 * Standardized logging with context, timestamps, and source location.
 * Respects NODE_ENV for debug logging.
 */

// =============================================================================
// Types
// =============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  /** Additional data to log */
  data?: unknown;
  /** Error object for stack trace */
  error?: Error;
}

// =============================================================================
// Configuration
// =============================================================================

/** Log level priority (higher = more severe) */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/** Minimum log level based on environment */
const getMinLogLevel = (): number => {
  const env = process.env['NODE_ENV'];
  return env === 'production' ? LOG_LEVELS.info : LOG_LEVELS.debug;
};

// =============================================================================
// Formatting
// =============================================================================

const getTimestamp = (): string => new Date().toISOString();

const getCallerLocation = (): string => {
  const error = new Error();
  const stack = error.stack?.split('\n') || [];
  
  // Stack trace: Error -> getCallerLocation -> log method -> logMessage -> actual caller
  const callerLine = stack[5] || stack[4] || '';
  
  // Extract file:line from stack trace
  const match = callerLine.match(/\((.+):(\d+):\d+\)/) || 
                callerLine.match(/at\s+(.+):(\d+):\d+/);
  
  if (match) {
    // Get just filename for cleaner output
    const fullPath = match[1];
    const fileName = fullPath?.split(/[/\\]/).pop() ?? 'unknown';
    return `${fileName}:${match[2] ?? '0'}`;
  }
  return '';
};

const formatMessage = (
  level: LogLevel,
  context: string,
  message: string,
  location: string
): string => {
  const timestamp = getTimestamp();
  const levelStr = level.toUpperCase().padEnd(5);
  const locationStr = location ? ` (${location})` : '';
  return `[${timestamp}] [${levelStr}] [${context}] ${message}${locationStr}`;
};

// =============================================================================
// Core Logging
// =============================================================================

const logMessage = (
  level: LogLevel,
  context: string,
  message: string,
  options?: LogOptions
): void => {
  // Check log level
  if (LOG_LEVELS[level] < getMinLogLevel()) {
    return;
  }

  const location = getCallerLocation();
  const formatted = formatMessage(level, context, message, location);

  // Select console method
  const consoleFn = level === 'error' ? console.error :
                    level === 'warn' ? console.warn :
                    level === 'debug' ? console.debug :
                    console.log;

  // Log message
  if (options?.data !== undefined) {
    consoleFn(formatted, options.data);
  } else {
    consoleFn(formatted);
  }

  // Log error stack separately for better visibility
  if (options?.error?.stack && level === 'error') {
    console.error(options.error.stack);
  }
};

// =============================================================================
// Public API
// =============================================================================

/**
 * Application logger
 * 
 * @example
 * ```typescript
 * logger.info('UserService', 'User created', { userId: '123' });
 * logger.error('AuthController', 'Login failed', { error: err });
 * logger.debug('Cache', 'Cache hit', { key: 'users' });
 * ```
 */
export const logger = {
  /**
   * Debug level - only logged in development
   */
  debug: (context: string, message: string, data?: unknown): void => {
    logMessage('debug', context, message, { data });
  },

  /**
   * Info level - general information
   */
  info: (context: string, message: string, data?: unknown): void => {
    logMessage('info', context, message, { data });
  },

  /**
   * Warning level - potential issues
   */
  warn: (context: string, message: string, data?: unknown): void => {
    logMessage('warn', context, message, { data });
  },

  /**
   * Error level - errors and exceptions
   */
  error: (context: string, message: string, errorOrData?: unknown): void => {
    if (errorOrData instanceof Error) {
      logMessage('error', context, message, { error: errorOrData });
    } else {
      logMessage('error', context, message, { data: errorOrData });
    }
  },
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Create a scoped logger for a specific context
 * 
 * @example
 * ```typescript
 * const log = createLogger('UserService');
 * log.info('User created');
 * log.error('Failed to create user', error);
 * ```
 */
export const createLogger = (context: string) => ({
  debug: (message: string, data?: unknown) => { logger.debug(context, message, data); },
  info: (message: string, data?: unknown) => { logger.info(context, message, data); },
  warn: (message: string, data?: unknown) => { logger.warn(context, message, data); },
  error: (message: string, errorOrData?: unknown) => { logger.error(context, message, errorOrData); },
});
