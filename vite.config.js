
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: ['pwa-icon.svg'],

      manifest: {
        name: 'Snake Arena',
        short_name: 'Snake',
        description: 'Play Snake Arena online and offline.',
        theme_color: '#080f1c',
        background_color: '#080f1c',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',

        icons: [
          {
            src: '/pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },

      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp,woff2}',
        ],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
