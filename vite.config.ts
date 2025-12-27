import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/Scribbles/',
    plugins: [react(), svgr({}), VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'service-worker.ts',
        manifest: {
            screenshots: [
                {
                    src: 'screenshots/screenshot_mobile.png',
                    sizes: '360x740',
                    form_factor: 'narrow',
                    type: 'image/png'
                },
                {
                    src: 'screenshots/screenshot_wide.png',
                    sizes: '1440x900',
                    form_factor: 'wide',
                    type: 'image/png'
                },
            ],
            icons: [
                {
                    src: 'logo512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any'
                }
            ]
        },
        includeAssets: ['favicon.ico'],
        injectManifest: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}']
        }
    })],
    server: {
        host: true,
        port: 3000,
    },
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/setupTests.ts'],
        globals: true,
        css: true,
        // Cap any single test at max 5 minutes to prevent runaway hangs
        testTimeout: 300000,
        hookTimeout: 300000,
        teardownTimeout: 300000,
        bail: 1 // Stop on first timeout/failure
    }
});
