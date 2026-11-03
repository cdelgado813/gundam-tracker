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
            // Imágenes de cartas de CardTrader. Al ser cross-origin sin CORS, las
            // respuestas son opacas (status 0) para CUALQUIER código HTTP, así que no
            // se puede distinguir un 200 de un 403/429/5xx. Con stale-while-revalidate
            // un error puntual de CardTrader quedaba cacheado y se servía como imagen
            // rota o placeholder. NetworkFirst vuelve a pedir siempre la imagen y solo
            // usa la caché si no hay red (offline) o tarda más de 4 s.
            urlPattern: /^https:\/\/(www\.)?cardtrader\.com\/.*\.(jpg|jpeg|png|webp)/,
            handler: 'NetworkFirst',
            options: {
              // v2: descarta las copias envenenadas que dejó la caché anterior.
              cacheName: 'card-images-v2',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 3000, maxAgeSeconds: 60 * 60 * 24 * 30 },
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
