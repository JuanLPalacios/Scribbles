import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), svgr({}), VitePWA({
        manifest: {
            screenshots: [
                {
                    src: '/screenshots/screenshot_mobile.png',
                    sizes: '360x740',
                    form_factor: 'narrow',
                    type: 'image/png'
                },
                {
                    src: '/screenshots/screenshot_wide.png',
                    sizes: '1440x900',
                    form_factor: 'wide',
                    type: 'image/png'
                },
            ],
            icons: [
                {
                    src: '/icons/logo512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any'
                }
            ]
        },
        includeAssets: ['/icons/favicon.webp'],
        registerType: 'autoUpdate'
    })],
    server: {
        host: true,
        port: 3000,
    },
});
