import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
            manifest: {
                name: 'نظام مؤسسة الجنوب الجديد',
                short_name: 'الجنوب الجديد',
                description: 'نظام إدارة الموارد والمقاولات - مؤسسة الجنوب الجديد',
                theme_color: '#0f172a',
                background_color: '#f3f4f6',
                display: 'standalone',
                orientation: 'portrait',
                dir: 'rtl',
                lang: 'ar-SA',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],
})
