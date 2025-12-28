/**
 * Log levels
 */
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Standardized logger utility for Client
 * Usage: logger.info('ModuleName', 'Message', data);
 */
const getTimestamp = () => new Date().toLocaleTimeString();

const getCallerInfo = () => {
  const error = new Error();
  const stack = error.stack?.split('\n') || [];
  // Browser stack traces are slightly different but usually:
  // 0: Error
  // 1: getCallerInfo
  // 2: logger.info
  // 3: caller
  const callerLine = stack[3] || '';
  
  // Clean up the line to just get the file path/url
  // Chrome: "    at Context.Authentication (http://localhost:5173/src/context/AuthContext.tsx:56:7)"
  const match = callerLine.match(/\((.*):(\d+):(\d+)\)/) || callerLine.match(/at\s+(.*):(\d+):(\d+)/);
  
  if (match) {
    return match[1] + ':' + match[2];
  }
  return '';
};

export const logger = {
  info: (context: string, message: string, ...args: any[]) => {
    const caller = getCallerInfo();
    console.log(`[${getTimestamp()}] [INFO] [${context}] ${message}`, ...args, caller ? `\n@ ${caller}` : '');
  },
  
  warn: (context: string, message: string, ...args: any[]) => {
    const caller = getCallerInfo();
    console.warn(`[${getTimestamp()}] [WARN] [${context}] ${message}`, ...args, caller ? `\n@ ${caller}` : '');
  },
  
  error: (context: string, message: string, ...args: any[]) => {
    const caller = getCallerInfo();
    console.error(`[${getTimestamp()}] [ERROR] [${context}] ${message}`, ...args, caller ? `\n@ ${caller}` : '');
  },
  
  debug: (context: string, message: string, ...args: any[]) => {
    // Only log debug in development (using Vite's import.meta.env.DEV)
    if (import.meta.env.DEV) {
      const caller = getCallerInfo();
      console.debug(`[${getTimestamp()}] [DEBUG] [${context}] ${message}`, ...args, caller ? `\n@ ${caller}` : '');
    }
  }
};
