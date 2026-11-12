# TrainingHafifa

A PWA for managing training areas and force deployment on a map (React, NestJS,
PostGIS, GeoServer).

## Mapping infrastructure

On Windows with Docker Desktop running, from the repo root:

```powershell
.\scripts\Setup.ps1
```

This starts PostGIS, GeoServer and pgAdmin, creates the database table, publishes
both map layers in EPSG:32636, and verifies the result.

- **[docs/SETUP.md](docs/SETUP.md)**: first-time setup on a new computer
  (prerequisites, what each script does, troubleshooting).
- **[docs/RUN.md](docs/RUN.md)**: running the project day to day (start, check,
  stop, URLs and logins).

## Server

NestJS API in [server/](server/): see [server/README.md](server/README.md).
