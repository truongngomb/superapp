import { type Plugin } from 'vite';
/**
 * Custom plugin to proxy /story-weaver/* to story-weaver dev server
 * This intercepts requests BEFORE Vite's SPA fallback serves index.html
 */
export declare function storyWeaverProxyPlugin(): Plugin;
