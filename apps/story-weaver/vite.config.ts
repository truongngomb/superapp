import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const appVersion = "1.0.0"; // Placeholder

export default defineConfig({
  define: {
    '__APP_VERSION__': JSON.stringify(appVersion),
  },
  plugins: [
    react(),
    // VitePWA({...})
  ],
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
    port: 3002,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild'
  }
});
