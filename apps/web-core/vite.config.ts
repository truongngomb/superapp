import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'SuperApp',
          short_name: 'SuperApp',
          description: 'Ứng dụng mẫu dùng phát triển các ứng dụng cho nhóm',
          theme_color: '#3b82f6',
          background_color: '#0f172a',
          display: 'standalone',
          icons: [
            {
              src: 'favicon.svg',
              sizes: '192x192',
              type: 'image/svg+xml'
            },
            {
              src: 'favicon.svg',
              sizes: '512x512',
              type: 'image/svg+xml'
            },
            {
              src: 'favicon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          navigateFallbackDenylist: [/^\/api/],
          maximumFileSizeToCacheInBytes: 5000000,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 // 1 day
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
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
      port: 5173,
      host: true,
      allowedHosts: env['VITE_ALLOWED_HOSTS'] 
        ? env['VITE_ALLOWED_HOSTS'].split(',').map(h => h.trim())
        : ['localhost', '127.0.0.1'],
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true
        }
      }
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
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
  };
});
