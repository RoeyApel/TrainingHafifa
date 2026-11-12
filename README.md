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

See **[docs/SETUP.md](docs/SETUP.md)** for prerequisites, what each script does,
and troubleshooting.
