/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type ProxyOptions } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_SHORT_NAME,
  BACKGROUND_COLOR,
  BRAND_COLOR,
} from './src/config/brand.ts';
import { API_BASE_PATH, GEOSERVER_BASE_PATH } from './src/config/endpoints.ts';

const DEFAULT_API_URL = 'http://localhost:3000';
const DEFAULT_GEOSERVER_URL = 'http://localhost:8080';

// Libraries change far less often than app code, so each gets its own chunk
// and stays cached across app deploys.
const VENDOR_CHUNKS = [
  { name: 'vendor-ol', test: /node_modules\/ol\// },
  { name: 'vendor-proj4', test: /node_modules\/(proj4|mgrs|wkt-parser)\// },
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

/**
 * The browser calls same-origin /api and /geoserver; the dev and preview
 * servers forward them. The server's routes have no /api prefix.
 */
const createProxy = (
  env: Record<string, string>,
): Record<string, ProxyOptions> => {
  return {
    [API_BASE_PATH]: {
      target: env.API_URL || DEFAULT_API_URL,
      changeOrigin: true,
      rewrite: (path) => path.slice(API_BASE_PATH.length),
    },
    [GEOSERVER_BASE_PATH]: {
      target: env.GEOSERVER_URL || DEFAULT_GEOSERVER_URL,
      changeOrigin: true,
    },
  };
};

export default defineConfig(({ mode }) => {
  const proxy = createProxy(loadEnv(mode, process.cwd(), ''));

  return {
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
          // Live data: never answer these with the cached app shell.
          navigateFallbackDenylist: [
            new RegExp(`^${API_BASE_PATH}/`),
            new RegExp(`^${GEOSERVER_BASE_PATH}/`),
          ],
          runtimeCaching: [
            {
              urlPattern: ({ url }) =>
                url.hostname === 'tile.openstreetmap.org',
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
    server: { port: 5173, strictPort: true, proxy },
    preview: { proxy },
    test: {
      environment: 'jsdom',
      setupFiles: ['./test/setup.ts'],
      include: ['test/**/*.test.{ts,tsx}'],
    },
  };
});
