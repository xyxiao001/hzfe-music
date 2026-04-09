import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      injectRegister: null,
      registerType: 'prompt',
      includeAssets: ['images/icon-256.ico', 'robots.txt'],
      manifest: {
        name: 'HZFE Music',
        short_name: 'HZFE Music',
        description: '本地音乐资料库',
        start_url: '/#/',
        scope: '/',
        display: 'standalone',
        background_color: '#0b0b0b',
        theme_color: '#000000',
        icons: [
          {
            src: '/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        shortcuts: [
          {
            name: '打开音乐库',
            short_name: '音乐库',
            url: '/#/',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === 'script' ||
              request.destination === 'style' ||
              request.destination === 'worker',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/at\.alicdn\.com\/t\/c\/.*$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'third-party',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
