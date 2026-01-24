import { type Plugin } from 'vite';
import http from 'http';

/**
 * Custom plugin to proxy /story-weaver/* to story-weaver dev server
 * This intercepts requests BEFORE Vite's SPA fallback serves index.html
 */
export function storyWeaverProxyPlugin(): Plugin {
  return {
    name: 'story-weaver-proxy',
    enforce: 'pre', // Run this plugin before others
    configureServer(server) {
      // NO return - middleware runs BEFORE Vite's built-in middleware
      server.middlewares.use((req, res, next) => {
        // Check if this is a story-weaver request
        if (req.url?.startsWith('/story-weaver')) {
          // Redirect /story-weaver to /story-weaver/ for consistency
          if (req.url === '/story-weaver') {
            res.writeHead(302, { Location: '/story-weaver/' });
            res.end();
            return;
          }
          
          // Pass URL through (story-weaver is now configured with base: '/story-weaver/')
          const targetUrl = req.url;
          
          const proxyReq = http.request(
            {
              hostname: '127.0.0.1',
              port: 3102,
              path: targetUrl,
              method: req.method,
              headers: { ...req.headers, host: '127.0.0.1:3102' },
            },
            (proxyRes: http.IncomingMessage) => {
              res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
              proxyRes.pipe(res);
            }
          );
          
          proxyReq.on('error', (err) => {
            console.error('[story-weaver-proxy] Proxy Error:', err.message);
            res.writeHead(502);
            res.end('Story Weaver service unavailable. Is it running on port 3102?');
          });
          
          req.pipe(proxyReq);
        } else {
          next();
        }
      });
      // NO return here - this is intentional
    },
  };
}
