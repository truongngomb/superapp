import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Read package.json to get version
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8')) as { version: string };
const appVersion = packageJson.version;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return ({
    base: '/story-weaver/',
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
      allowedHosts: env['VITE_ALLOWED_HOSTS']
        ? env['VITE_ALLOWED_HOSTS'].split(',').map(h => h.trim())
        : ['localhost', '127.0.0.1'],
      proxy: {
        // Proxy story-weaver specific API calls to microservice
        // Rewrite: /api/story-weaver/* -> /api/*
        '/api/story-weaver': {
          target: 'http://127.0.0.1:3002',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/story-weaver/, '/api'),
        },
        // Proxy core API calls to main api-server
        '/api': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true
        }
      }
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      emptyOutDir: true,
      // Build directly into web-core public directory
      outDir: '../../apps/web-core/public/apps/story-weaver',
      rollupOptions: {
        // Exclude eruda from production build (only needed for debug)
        external: (id) => {
          if (process.env.NODE_ENV === 'production' && id === 'eruda') {
            return true;
          }
          return false;
        },
        output: {
          manualChunks: (id: string) => {
            // Core React
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'react-vendor';
            }
            // Router
            if (id.includes('node_modules/react-router')) {
              return 'router';
            }
            // Animations
            if (id.includes('node_modules/framer-motion')) {
              return 'animations';
            }
            // Icons
            if (id.includes('node_modules/lucide-react')) {
              return 'icons';
            }
            // Virtualization
            if (id.includes('node_modules/react-window')) {
              return 'virtualization';
            }
          }
        }
      }
    }
  })
});
