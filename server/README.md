# Server

Backend API for managing training areas and force deployment.
NestJS + TypeScript (ESM, pnpm, Vitest + SWC, ESLint + Prettier, pino logging,
PostGIS + TypeORM). Writes to force polygons go through GeoServer WFS-T.

> **Status: template.** The structure, tooling and database entity are in place;
> the routes and business logic are TODOs (see [What's left](#whats-left)).

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

> **Port 5432 conflict:** if PostgreSQL is also installed on Windows, it takes
> `localhost:5432` and the server connects to it instead of the PostGIS
> container (you'll see `password authentication failed for user "postgres"`).
> Stop the Windows PostgreSQL service, or make the server use another route
> to PostGIS.

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
  forces/                     force polygon routes + business logic (TODO)
  geoserver/                  GeoServer WFS-T client (TODO)
  health/                     GET /health
  common/geo/                 SRID 32636 constants
  common/logging/             pino logger config
test/
  unit/                       unit tests
  e2e/                        HTTP tests against the app with a stubbed DB
```

## Database schema

TypeORM owns the schema (`synchronize: true`): entities are the source of truth
and tables are created or altered to match them on startup. The
`ForceDeployment` entity matches the existing `force_deployment` table exactly,
so startup changes nothing.

Be careful when changing an entity: renaming a column or changing the
geometry type makes TypeORM **drop and recreate** the column, which loses its
data and can break the GeoServer layer.

## What's left

- **Routes** (`forces.controller.ts`): `POST /forces`, `PATCH /forces/:id`,
  `DELETE /forces/:id` (soft delete: sets `is_deleted = true`).
- **WFS-T client** (`geoserver-wfs.service.ts`): Insert / Update transactions
  against GeoServer.
- **Spatial check** (`forces.service.ts`), before saving a new or edited force:
  - intersects a training area with status `maintenance` → block, return an
    error (red: "השטח המבוקש סגור לתחזוקה")
  - intersects a training area with type `live_fire` → save, return a warning
    (orange: "התראת בטיחות חמורה")
  - otherwise → save, return success (green: "האימון נקבע בהצלחה")
- **Where to read training areas from:** they currently live only in the
  GeoPackage that GeoServer publishes, not in PostGIS. To be decided.
- **CORS**, once the React client runs on its own port.
