/**
 * Log levels
 */
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Standardized logger utility
 * Usage: logger.info('ModuleName', 'Message', data);
 */
const getTimestamp = () => new Date().toISOString();

const getCallerInfo = () => {
  const error = new Error();
  // Stack trace lines:
  // 0: Error
  // 1: at getCallerInfo
  // 2: at Object.info/warn/error (the logger method)
  // 3: at ActualCaller (THIS IS WHAT WE WANT)
  const stack = error.stack?.split('\n') || [];
  
  // Find the first line that isn't from this file
  // Note: This is a simple heuristic and might need adjustment based on environment/build
  const callerLine = stack[3] || '';
  
  // Extract file path and line number
  const match = callerLine.match(/\((.*):(\d+):(\d+)\)/) || callerLine.match(/at\s+(.*):(\d+):(\d+)/);
  if (match) {
    // Return relative path or full path depending on preference. 
    // VS Code terminal handles absolute paths well.
    return match[1] + ':' + match[2];
  }
  return '';
};

export const logger = {
  info: (context: string, message: string, ...args: any[]) => {
    const caller = getCallerInfo();
    console.log(`[${getTimestamp()}] [INFO] [${context}] ${message} ${caller ? `(${caller})` : ''}`, ...args);
  },
  
  warn: (context: string, message: string, ...args: any[]) => {
    const caller = getCallerInfo();
    console.warn(`[${getTimestamp()}] [WARN] [${context}] ${message} ${caller ? `(${caller})` : ''}`, ...args);
  },
  
  error: (context: string, message: string, ...args: any[]) => {
    const caller = getCallerInfo();
    console.error(`[${getTimestamp()}] [ERROR] [${context}] ${message} ${caller ? `(${caller})` : ''}`, ...args);
  },
  
  debug: (context: string, message: string, ...args: any[]) => {
    // Only log debug in non-production
    if (process.env['NODE_ENV'] !== 'production') {
      const caller = getCallerInfo();
      console.debug(`[${getTimestamp()}] [DEBUG] [${context}] ${message} ${caller ? `(${caller})` : ''}`, ...args);
    }
  }
};
