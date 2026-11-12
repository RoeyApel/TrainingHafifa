# Mapping infrastructure setup (PostGIS + GeoServer)

This guide is for a person **or an AI assistant (e.g. Claude Code)** setting up the
project's mapping infrastructure on a Windows computer. The PowerShell scripts in
`scripts/` rebuild the whole environment with one command.

> **For an AI assistant:** follow the sections in order. Run commands from the
> repository root in **Windows PowerShell**. Every script is idempotent (safe to
> re-run). Don't edit `infra/docker-compose.yml`; the scripts depend on it as-is.
> If a step fails, read the `[FAIL]` / error message: each one says what to do.

---

## 1. What gets built

| Piece | What it is | Where |
|---|---|---|
| **PostGIS** | PostgreSQL + spatial extension. Database `imunim`. | `localhost:5432` |
| **GeoServer** | Map server that publishes the layers (WMS/WFS). | http://localhost:8080/geoserver |
| **pgAdmin** | Web UI for browsing the database. | http://localhost:5050 |

Two published layers in GeoServer workspace **`imunim`**, both in **EPSG:32636**
(WGS 84 / UTM zone 36N):

| Layer | Source | Attributes | Style |
|---|---|---|---|
| `imunim:training_areas` (שטחי אש ואימונים) | Static GeoPackage drawn in QGIS: `geoserver/data/training_areas.gpkg` | `area_name`, `training_type` (`live_fire` / `dry` / `laser`), `status` (`active` / `maintenance`), `is_deleted` | Different look per `status` |
| `imunim:force_deployment` (פריסת כוחות) | PostGIS table, edited by the app | `unit_name`, `troops_count`, `vehicles_count`, `commander_name`, `training_date`, `is_deleted` | Fill + unit name label |

Both layers have the CQL filter `is_deleted = false`, so soft-deleted features never
appear in GeoServer.

---

## 2. Prerequisites (one-time, manual)

1. **Docker Desktop** for Windows, using the WSL 2 backend (the installer's default).
   Start it and wait for **"Engine running"**.
2. **QGIS** (optional): only needed to *edit* the training areas.
3. Free ports: **5432**, **8080**, **5050**. A locally installed PostgreSQL often
   takes 5432; stop it first.

Check:

```powershell
docker --version
docker info
```

### Allow running the scripts

Windows blocks `.ps1` files by default.

bypass it for a single run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Setup.ps1
```

---

## 3. Quick start

From the repository root:

```powershell
.\scripts\Setup.ps1
```

That's all. It runs the four steps below in order, stops at the first failure, and
ends with `All checks passed`. The first run takes several minutes while Docker
downloads the images.

After setup, see [RUN.md](RUN.md) for starting, checking and stopping the project
day to day.

Options:

```powershell
.\scripts\Setup.ps1 -SkipSeed     # empty force_deployment table, no sample rows
```

> **If folder creation fails** with "access denied" on `C:\ProgramData\GeoServer`,
> open PowerShell **as Administrator** and run the script once from there.

---

## 4. The scripts, step by step

Each step can also be run on its own.

| Script | What it does | When to run it alone |
|---|---|---|
| `01-Start-Infrastructure.ps1` | Checks Docker, creates `C:\ProgramData\GeoServer`, runs `docker compose up -d`, waits until PostGIS and GeoServer respond. | After a reboot, if the containers aren't up. |
| `02-Initialize-Database.ps1 [-SkipSeed]` | Runs `db/01_schema.sql` (table + spatial index) and `db/02_seed.sql` (3 sample rows, one soft-deleted) inside the `postgis` container. | After changing the SQL files. |
| `03-Publish-GeoServer.ps1` | Copies the `.gpkg` to `C:\ProgramData\GeoServer\gpkg\`, then uses the GeoServer REST API to create the workspace, both data stores, both styles and both layers. | After editing an SLD file or the GeoPackage. |
| `04-Test-Setup.ps1` | Read-only checks: containers, SRID, layers published in EPSG:32636, CQL filter, default style, WFS returns features with no soft-deleted ones, WMS renders a PNG. | Any time, to check the environment. |
| `Setup.ps1` | Runs 01 → 02 → 03 → 04. | New computer, or "just fix everything". |

How "safe to re-run" works:
- **SQL:** `CREATE ... IF NOT EXISTS`; the seed only inserts into an **empty** table.
- **GeoServer:** each resource is created if missing, or **updated to match the repo**
  if it exists. Manual changes made in the GeoServer web UI to these resources are
  overwritten on the next run, so change the files in the repo instead.
- **GeoPackage:** copied only when its content changed (compared by hash); GeoServer's
  cache is then reset so it reads the new file.

---

## 5. Repository layout

```
infra/docker-compose.yml          PostGIS, GeoServer, pgAdmin (do not modify)
db/01_schema.sql                  Layer 2 table: force_deployment
db/02_seed.sql                    Layer 2 sample rows
geoserver/data/training_areas.gpkg  Layer 1 data: training areas (drawn in QGIS, EPSG:32636)
geoserver/styles/*.sld            SLD styles for both layers
scripts/config.psd1               All names, ports, paths, credentials (one place)
scripts/lib/Common.psm1           Helpers: config, console output, docker commands, waiting
scripts/lib/GeoServerRest.psm1    Idempotent GeoServer REST client (Set-Gs* functions)
scripts/0X-*.ps1, Setup.ps1       The setup steps
docs/SETUP.md                     This guide
```

`scripts/config.psd1` must stay consistent with `infra/docker-compose.yml`
(container names, ports, DB name and password). Change both together.

---

## 6. Common tasks

**Change a style:** edit `geoserver/styles/<name>.sld` →
`.\scripts\03-Publish-GeoServer.ps1`. Values in SLD filters must match the data
exactly (`active` ≠ `Active`).

**Edit the training areas:** open `geoserver/data/training_areas.gpkg` in QGIS (project CRS
EPSG:32636), edit, save, **close QGIS** → `.\scripts\03-Publish-GeoServer.ps1`.

**Add a layer:** add the data (SQL file or GeoPackage), an SLD in `geoserver/styles/`,
and an entry in `Layers` (and `DataStores` if it's a new store) in
`scripts/config.psd1`; then run `03` and `04`.

**Start over with an empty database:** this deletes all DB data.

```powershell
docker compose -f infra/docker-compose.yml down -v
.\scripts\Setup.ps1
```

(`down -v` removes the PostGIS and pgAdmin volumes. GeoServer's config lives in
`C:\ProgramData\GeoServer` and is kept; script 03 brings it back in line anyway.)

---

## 7. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Docker is installed but not running` | Docker Desktop is closed | Start it, wait for "Engine running" |
| `port is already allocated` | Another program uses 5432/8080/5050 | Stop it (often a local PostgreSQL service) |
| `running scripts is disabled on this system` | Execution policy | See "Allow running the scripts" above |
| Access denied on `C:\ProgramData\GeoServer` | No write permission | Run PowerShell as Administrator once |
| Timed out waiting for GeoServer | First boot is slow | Run `Setup.ps1` again; check `docker logs geoserver` |
| Copying the `.gpkg` fails | QGIS has the file open | Close QGIS and re-run step 03 |
| Layer appears in the wrong place | Data not in EPSG:32636 | Check the CRS in QGIS / the SRID in the DB |

Useful commands:

```powershell
docker ps                                  # which containers are running
docker logs geoserver --tail 50            # GeoServer log
docker exec -it postgis psql -U postgres -d imunim   # SQL shell
```

---

## 8. Credentials (local development only)

| Service | User | Password |
|---|---|---|
| PostGIS | `postgres` | `Aa123456` |
| GeoServer | `admin` | `geoserver` |
| pgAdmin | `admin@admin.com` | `admin` |

In pgAdmin, register the server with host **`postgis`** (the compose service name),
not `localhost`.
