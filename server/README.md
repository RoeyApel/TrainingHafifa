# Server

Backend API for managing training areas and force deployment.
NestJS + TypeScript (ESM, pnpm, Jest + SWC, ESLint + Prettier, pino logging,
PostGIS + TypeORM). Writes to force polygons go through GeoServer WFS-T.

## Getting started

Prerequisites: Node.js 22.12+, pnpm (`corepack enable`), and the mapping
infrastructure running (`..\scripts\Setup.ps1`, see [docs/SETUP.md](../docs/SETUP.md)).

```bash
pnpm install
cp .env.example .env   # defaults match the local infrastructure
pnpm dev               # http://localhost:3000, restarts on file changes
```

- API docs (Swagger): http://localhost:3000/docs
- Health: `GET /health`

> **PostGIS is on port 5434**, not 5432, so a PostgreSQL installed on Windows
> can keep 5432. If you see `password authentication failed for user
"postgres"`, the server reached that other PostgreSQL: check `DB_PORT=5434`.

## Scripts

| Script            | Purpose                                     |
| ----------------- | ------------------------------------------- |
| `pnpm dev`        | Run in watch mode                           |
| `pnpm build`      | Compile to `dist/`                          |
| `pnpm start`      | Run the compiled build                      |
| `pnpm typecheck`  | Type-check `src` and `test`                 |
| `pnpm lint`       | ESLint + Prettier check                     |
| `pnpm format`     | Format all files with Prettier              |
| `pnpm test`       | Unit tests (`test/unit`)                    |
| `pnpm test:e2e`   | End-to-end tests (`test/e2e`, no DB needed) |
| `pnpm test:watch` | Unit tests in watch mode                    |

## Structure

```
src/
  main.ts                     bootstrap (logger, validation, Swagger)
  app.module.ts               root module
  app.setup.ts                validation pipe + Swagger, shared with tests
  config/                     env validation (fails fast on bad .env)
  database/                   TypeORM connection
  entities/                   TypeORM entities (force_deployment)
  forces/                     force routes, safety rules, feature mapping
  geoserver/                  WFS client: XML builder/parser + HTTP service
  training-areas/             training areas (layer 1), read through WFS
  health/                     GET /health
  common/geo/                 polygon validator, WKT
  common/logging/             pino logger config
  types/<feature>/            shared types, one folder per feature (geo = SRID + GeoServer WFS):
    enums.ts                    enums
    types.ts                    consts (at the top), types, DTOs
test/
  unit/                       unit tests
  e2e/                        HTTP tests against the app with a stubbed DB
```

Only what is shared between files lives in `types/`. A type, enum or const
used by a single file stays in that file.

## Database schema

TypeORM owns the schema (`synchronize: true`): entities are the source of truth
and tables are created or altered to match them on startup. The
`ForceDeployment` entity matches the existing `force_deployment` table exactly,
so startup changes nothing.

Be careful when changing an entity: renaming a column or changing the
geometry type makes TypeORM **drop and recreate** the column, which loses its
data and can break the GeoServer layer.

## Forces API

Writes never touch PostGIS directly: they are WFS-T transactions against
GeoServer (`geoserver/`). TypeORM is used only to read (existence checks).
Geometries are GeoJSON Polygons in EPSG:32636 (meters). The request DTO
rejects invalid ones with a `400` that names the problem, e.g.
`Self-intersection at (700500, 3550500)`: first the shape (closed rings,
coordinates inside the EPSG:32636 bounds, at most 5,000 positions), then the
topology with JTS (`jsts`), the same rules as PostGIS's `ST_IsValid`. The
table's `chk_force_deployment_geom_valid` CHECK constraint backs this up for
writes that bypass the API.

| Route                | Body             | Result                                                |
| -------------------- | ---------------- | ----------------------------------------------------- |
| `POST /forces`       | `CreateForceDto` | `201 { id, outcome, message }`                        |
| `PATCH /forces/:id`  | `UpdateForceDto` | `200 { id, outcome, message }`; omitted = unchanged   |
| `DELETE /forces/:id` | none             | `204`; soft delete (`is_deleted = true`), row is kept |

Before a create or edit is saved, GeoServer finds the training areas the
polygon intersects (ECQL `INTERSECTS`). Touching a boundary counts.

| Overlaps                 | Saved? | Response                                           |
| ------------------------ | ------ | -------------------------------------------------- |
| an area in `maintenance` | no     | `409` "השטח המבוקש סגור לתחזוקה" (red)             |
| a `live_fire` area       | yes    | `outcome: "warning"` "התראת בטיחות חמורה" (orange) |
| anything else / nothing  | yes    | `outcome: "approved"` "האימון נקבע בהצלחה" (green) |

An edit that changes only attributes re-checks the stored polygon. Other
errors: `400` invalid body or id, `404` no active force with that id, `502`
GeoServer rejected the request or is unreachable (details are logged, not
returned).

## What's left

- **CORS**, once the React client runs on its own port.
