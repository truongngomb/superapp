export const logger = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: (context: string, message: string, meta?: any) => {
    console.log(`[INFO] [${context}] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn: (context: string, message: string, meta?: any) => {
    console.warn(`[WARN] [${context}] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (context: string, message: string, meta?: any) => {
    console.error(`[ERROR] [${context}] ${message}`, meta ? JSON.stringify(meta) : '');
  },
};
