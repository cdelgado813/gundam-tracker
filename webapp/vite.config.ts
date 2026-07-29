import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registro propio en main.tsx (con comprobación periódica de versión nueva):
      // el registerSW.js por defecto solo se registra una vez y nunca vuelve a
      // mirar si hay una versión nueva mientras la pestaña sigue abierta.
      injectRegister: false,
      manifest: {
        name: 'Gundam Tracker',
        short_name: 'Gundam Tracker',
        description: 'Gestiona tu colección del Gundam Card Game: colección, wishlist y trades.',
        theme_color: '#0b0f1a',
        background_color: '#07090f',
        display: 'standalone',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // imágenes de cartas de CardTrader: stale-while-revalidate (design D2)
            urlPattern: /^https:\/\/(www\.)?cardtrader\.com\/.*\.(jpg|jpeg|png|webp)/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'card-images',
              expiration: { maxEntries: 3000, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
