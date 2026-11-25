# Client

Single-page PWA for managing training areas and force deployment on a map.
React 19 + TypeScript, built with Vite, MUI for the UI (right-to-left, Hebrew)
and OpenLayers for the map.

## Getting started

Prerequisites: Node.js 22.12+, pnpm (`corepack enable`), the mapping
infrastructure (`..\scripts\Setup.ps1`) and the API server (`pnpm --dir
../server dev`). The map itself loads without them; the GeoServer layers,
the details popup and saving need them.

```bash
pnpm install
pnpm dev               # http://localhost:5173
```

The browser only talks to its own origin: the dev and preview servers proxy
`/api/*` to the API server (dropping the `/api` prefix) and `/geoserver/*` to
GeoServer, so neither needs CORS. The targets default to
`http://localhost:3000` and `http://localhost:8080`; to change them, copy
`.env.example` to `.env.local`. A production deployment needs the same two
routes on its reverse proxy.

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
  main.tsx                  registers EPSG:32636, mounts <App> inside the providers
  App.tsx                   the app's single screen: title bar over the map
  AppProviders.tsx          query client, RTL styling, MUI theme
  components/<Name>/        one folder per component: <Name>.tsx (+ its CSS) and an
                            index.ts, so imports read `components/<Name>`
  api/                      HTTP and GeoServer requests: axiosInstance, api
    hooks/                  TanStack Query hooks: useIdentify, useForces,
                            useSaveForce, useDeleteForce
  hooks/                    other hooks: useMap, useMapClick, useMapZoom,
                            useFitToGeometry, useGeoServerLayers,
                            useForceEditor
  mappers/                  GeoServer features → domain, domain → API body / form
  types/<feature>/          shared types, one folder per feature (as in server/):
    enums.ts                  enums
    types.ts                  consts (at the top), types
  contexts/                 React contexts (the map)
  map/                      OpenLayers setup: createMap, OSM and WMS layers,
                            projections
  schemas/                  zod schemas (the force form)
  state/                    reducers (the force editor's steps)
  config/                   brand, endpoints, map view, query client
  theme/                    MUI theme and the RTL style cache
  utils/                    small pure helpers (date format, save messages)
test/                       mirrors src/: api, components, mappers, schemas, ...
```

As in the server, only what is shared between files lives in `types/`; a
type or const used by a single file stays in that file.
`components/MapScreen` is the one place that wires the map, the layers, the
details popup and the force editor together. Every map layer, overlay and
interaction is added to the single map from `useMap()` and removed again when
its component unmounts.

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

The base map is OpenStreetMap, and the view is in EPSG:3857 (the tiles'
projection). The data is in EPSG:32636: GeoServer reprojects the WMS images,
WFS answers in EPSG:32636 and is read into map coordinates, and polygons are
converted back to EPSG:32636 before they are sent to the API.

### Layers

Both layers are WMS images rendered by GeoServer with their SLD styles
(`geoserver/styles/`): training areas below, forces above. Every WMS and WFS
request carries `CQL_FILTER=is_deleted = false`, so GeoServer itself leaves
out deleted features; the client never filters them. After a force is saved
or deleted, the forces layer is re-requested.

### Details popup

A click on the map sends one WFS `GetFeature` per layer with
`INTERSECTS(<geometry>, POINT(x y))` at the clicked point, and shows the
training areas and forces found there. A new click cancels the previous
request (TanStack Query).

### Adding, editing and deleting forces

| Action | Flow                                                                                        |
| ------ | ------------------------------------------------------------------------------------------- |
| Add    | "הוספת כוח" → click the corners, double-click to finish → fill the form → `POST /forces`    |
| Edit   | Click the force → "עריכה" → drag the corners → "המשך" → edit the form → `PATCH /forces/:id` |
| Delete | Click the force → "מחיקה" → confirm → `DELETE /forces/:id` (soft delete)                    |

The server's safety check decides the result, shown as a colored message:
green when saved, orange when saved in a live-fire area, red when the polygon
touches an area closed for maintenance (`409`). On a red result, or an
invalid polygon (`400`), the editor returns to the shape so it can be moved,
keeping what was typed in the form.

The steps live in one reducer (`state/forceEditorReducer.ts`),
so an action that doesn't fit the current step is ignored, and map clicks
open the details popup only when no edit is in progress.
