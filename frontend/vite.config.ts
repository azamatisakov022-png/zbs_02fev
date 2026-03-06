import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.svg', 'pwa-192x192.svg', 'pwa-512x512.svg'],
      manifest: {
        name: 'АИС «Цифровой реестр отходов»',
        short_name: 'АИС ЦРО',
        description: 'Автоматизированная информационная система Министерства природных ресурсов, экологии и технического надзора Кыргызской Республики',
        theme_color: '#2D8B4E',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'ru',
        categories: ['government', 'environment', 'utilities'],
        icons: [
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
        screenshots: [],
        shortcuts: [
          {
            name: 'Реестр отходов',
            short_name: 'Реестр',
            url: '/registry',
            icons: [{ src: 'pwa-192x192.svg', sizes: '192x192' }],
          },
          {
            name: 'Калькулятор платежей',
            short_name: 'Калькулятор',
            url: '/calculator',
            icons: [{ src: 'pwa-192x192.svg', sizes: '192x192' }],
          },
          {
            name: 'ГИС-карта',
            short_name: 'Карта',
            url: '/gis-map',
            icons: [{ src: 'pwa-192x192.svg', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        // Cache strategies
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,ico,woff,woff2}'],
        // Runtime caching for API calls
        runtimeCaching: [
          {
            // Cache API responses for offline access
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Cache images
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            // Cache fonts
            urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            // Cache map tiles (Leaflet/MapLibre)
            urlPattern: /^https?:\/\/.*tile.*\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
        // Offline fallback
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        enabled: false, // Set to true to test PWA in dev mode
      },
    }),
  ],
  server: {
    allowedHosts: ['hitless-zahra-nondoubtingly.ngrok-free.dev'],
  },
})
