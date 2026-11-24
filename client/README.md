# Client

Single-page PWA for managing training areas and force deployment on a map.
React 19 + TypeScript, built with Vite, MUI for the UI (right-to-left, Hebrew)
and OpenLayers for the map.

## Getting started

Prerequisites: Node.js 22.12+ and pnpm (`corepack enable`).

```bash
pnpm install
pnpm dev               # http://localhost:5173
```

## Scripts

| Script           | Purpose                                                   |
| ---------------- | --------------------------------------------------------- |
| `pnpm dev`       | Dev server with hot module replacement                    |
| `pnpm build`     | Type-check and build to `dist/` (with the service worker) |
| `pnpm preview`   | Serve the build locally, the place to check the PWA       |
| `pnpm typecheck` | Type-check `src`, `test` and `vite.config.ts`             |
| `pnpm lint`      | ESLint + Prettier check                                   |
| `pnpm format`    | Format all files with Prettier                            |
| `pnpm test`      | Unit tests (Vitest + Testing Library, jsdom)              |

## Structure

```
index.html                  entry page (lang="he", dir="rtl")
vite.config.ts              Vite, PWA (manifest, service worker), vendor chunks, Vitest
public/favicon.svg          source for every generated app icon
src/
  main.tsx                  mounts <App> inside the providers
  app/                      app shell: layout, providers, theme, RTL cache, brand
  features/map/             the map feature
    components/MapView.tsx    element that hosts the map
    hooks/useOlMap.ts         owns the OpenLayers map instance
    config/map.config.ts      initial center, zoom limits
    layers/                   map layers (OSM base layer)
test/                       unit tests
```

Code is grouped by feature. New map content (forces, training areas) goes in
its own folder under `features/` and adds layers to the map that `useOlMap`
returns.

## Why Vite and not Create React App

Create React App is deprecated and no longer maintained. It bundles the whole
app with webpack before the dev server starts, so startup and hot reload get
slower as the app grows, and its config is hidden unless you `eject`.
Vite serves source files as native ES modules in development, so startup is
near-instant and hot reload updates only the changed module. It builds with
Rolldown for production, supports TypeScript out of the box, keeps its config
in one small file, and has a maintained PWA plugin (`vite-plugin-pwa`).

## PWA

`vite-plugin-pwa` generates the web manifest and a Workbox service worker at
build time. The icons are generated from `public/favicon.svg`. The service
worker:

- precaches the app shell, so the app opens offline;
- caches OpenStreetMap tiles (cache first, up to 500 tiles for 7 days), so
  areas already viewed still show offline;
- updates itself when a new version is deployed (`registerType: 'autoUpdate'`).

The service worker only runs in a build: check it with `pnpm build && pnpm
preview`, then DevTools → Application → Service workers / Manifest.

## Map

The base map is OpenStreetMap through OpenLayers, in EPSG:3857 (the tiles'
projection). The server's layers are in EPSG:32636; they will be reprojected
when they are added to the map.
