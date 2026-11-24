/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_SHORT_NAME,
  BACKGROUND_COLOR,
  BRAND_COLOR,
} from './src/app/brand.ts';

// Libraries change far less often than app code, so each gets its own chunk
// and stays cached across app deploys.
const VENDOR_CHUNKS = [
  { name: 'vendor-ol', test: /node_modules\/ol\// },
  { name: 'vendor-mui', test: /node_modules\/(@mui|@emotion|stylis)/ },
  {
    name: 'vendor-react',
    test: /node_modules\/(react|react-dom|scheduler)\//,
  },
];

const SECONDS_PER_DAY = 24 * 60 * 60;
const OSM_TILE_CACHE_DAYS = 7;
// Enough tiles for a few sessions over one region without growing unbounded.
const OSM_TILE_CACHE_MAX_ENTRIES = 500;

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Icons, favicon and apple-touch links are generated from this SVG at
      // build time, so there are no hand-made PNGs to keep in sync.
      pwaAssets: {
        image: 'public/favicon.svg',
        preset: 'minimal-2023',
        overrideManifestIcons: true,
      },
      manifest: {
        name: APP_NAME,
        short_name: APP_SHORT_NAME,
        description: APP_DESCRIPTION,
        lang: 'he',
        dir: 'rtl',
        display: 'standalone',
        start_url: '/',
        theme_color: BRAND_COLOR,
        background_color: BACKGROUND_COLOR,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname === 'tile.openstreetmap.org',
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: {
                maxEntries: OSM_TILE_CACHE_MAX_ENTRIES,
                maxAgeSeconds: OSM_TILE_CACHE_DAYS * SECONDS_PER_DAY,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rolldownOptions: {
      output: { codeSplitting: { groups: VENDOR_CHUNKS } },
    },
  },
  server: { port: 5173, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.{ts,tsx}'],
  },
});
