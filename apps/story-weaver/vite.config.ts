import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const appVersion = "1.0.0";

export default defineConfig(({ mode }) => ({
  // Base path for production deployment (micro-frontend)
  base: mode === 'production' ? '/story-weaver/' : '/',
  
  define: {
    '__APP_VERSION__': JSON.stringify(appVersion),
  },
  
  plugins: [react()],
  
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@superapp/shared-types': path.resolve(__dirname, '../../packages/shared-types/src'),
      '@superapp/core-logic': path.resolve(__dirname, '../../packages/core-logic/src'),
      '@superapp/ui-kit': path.resolve(__dirname, '../../packages/ui-kit/src')
    }
  },
  
  server: {
    port: 3102,
    host: true,
    proxy: {
      // Proxy core API calls to main api-server
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      },
      // Proxy story-weaver specific API calls to microservice
      '/api/story-weaver': {
        target: 'http://127.0.0.1:3002',
        changeOrigin: true
      }
    }
  },
  
  build: {
    // Build directly into web-core public directory
    outDir: '../../apps/web-core/public/apps/story-weaver',
    emptyOutDir: true,
    target: 'esnext',
    minify: 'esbuild'
  }
}));
