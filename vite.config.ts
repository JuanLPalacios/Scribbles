import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    resolve: {
        alias: {
            '~': path.resolve(__dirname, './src'),
            '@assets': path.resolve(__dirname, './src/assets'),
            '@components': path.resolve(__dirname, './src/components'),
            '@ui': path.resolve(__dirname, './src/components/ui'),
            '@api': path.resolve(__dirname, './src/api'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@scripts': path.resolve(__dirname, './src/scripts'),
            '@store': path.resolve(__dirname, './src/store'),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@styles': path.resolve(__dirname, './src/styles'),
        },
    },
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
        host: '127.0.0.1',
        port: 3000,
    },
    build: {
        rollupOptions: {
            external: [/^node:\w+/],
        },
    },
});
