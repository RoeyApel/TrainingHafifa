# Running the project day to day

How to start, check and stop the project on a computer that is **already set up**.
For the first-time setup on a new computer, see [SETUP.md](SETUP.md).

All commands run from the repository root in **Windows PowerShell**.

---

## Quick reference

| I want to... | Command |
|---|---|
| Start everything | `.\scripts\01-Start-Infrastructure.ps1` |
| Check everything works | `.\scripts\04-Test-Setup.ps1` |
| Apply changes to styles / the GeoPackage | `.\scripts\03-Publish-GeoServer.ps1` |
| Stop everything (data is kept) | `docker compose -f infra/docker-compose.yml stop` |
| See what's running | `docker ps` |

---

## 1. Start

1. Open **Docker Desktop** and wait for **"Engine running"**.
2. Start the containers and wait until they're ready:

   ```powershell
   .\scripts\01-Start-Infrastructure.ps1
   ```

   It ends with `Infrastructure is up`. If the containers are already running, it
   just confirms that.

> **After a reboot:** the containers have `restart: always`, so they come back by
> themselves as soon as Docker Desktop starts. To have Docker Desktop start
> automatically, turn on *Settings → General → Start Docker Desktop when you sign in*.
> GeoServer needs about a minute after that before it answers.

---

## 2. Check it's healthy

```powershell
.\scripts\04-Test-Setup.ps1
```

It only reads, never changes anything, and ends with `All checks passed`. A `[FAIL]` line
says what's wrong; the usual fix is to run `.\scripts\Setup.ps1`, which repairs
whatever is missing.

---

## 3. Where things are

| Service | URL | Login |
|---|---|---|
| GeoServer admin | http://localhost:8080/geoserver | `admin` / `geoserver` |
| GeoServer Layer Preview | http://localhost:8080/geoserver/web/wicket/bookmarkable/org.geoserver.web.demo.MapPreviewPage | |
| pgAdmin | http://localhost:5050 | no login (server host: `postgis`) |
| PostGIS (from your computer) | `localhost:5432`, database `imunim` | `postgres` / `Aa123456` |

Layer endpoints that the client app will use (workspace `imunim`, EPSG:32636):

```
WMS (map images):  http://localhost:8080/geoserver/imunim/wms
WFS (features):    http://localhost:8080/geoserver/imunim/ows?service=WFS
Layers:            imunim:training_areas, imunim:force_deployment
```

Quick test in the browser, which returns the forces as GeoJSON:

```
http://localhost:8080/geoserver/imunim/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=imunim:force_deployment&outputFormat=application/json
```

---

## 4. Everyday changes

| Change | What to do |
|---|---|
| Edit a style | Edit `geoserver/styles/<name>.sld`, then run `03-Publish-GeoServer.ps1` |
| Edit training areas | Open `geoserver/data/training_areas.gpkg` in QGIS, edit, save, **close QGIS**, then run `03-Publish-GeoServer.ps1` |
| Change the DB table | Edit `db/01_schema.sql`, then run `02-Initialize-Database.ps1`. It only creates what's missing; to change an existing column, run an `ALTER TABLE` yourself in pgAdmin and update the SQL file to match |
| Look at the data | pgAdmin, or `docker exec -it postgis psql -U postgres -d imunim` |

Make changes in the repo files, not in the GeoServer web UI. Script 03 overwrites
UI changes to the layers, stores and styles it manages.

---

## 5. Stop

```powershell
docker compose -f infra/docker-compose.yml stop
```

Stops the containers and keeps all data. Start them again with step 1.

| Command | Containers | DB data | GeoServer config |
|---|---|---|---|
| `... stop` | stopped | kept | kept |
| `... down` | removed | kept | kept |
| `... down -v` | removed | **deleted** | kept |

Use `down -v` only to start the database over from scratch, followed by
`.\scripts\Setup.ps1`.

---

## 6. Logs and troubleshooting

```powershell
docker logs geoserver --tail 50      # GeoServer
docker logs postgis --tail 50        # PostGIS
docker compose -f infra/docker-compose.yml restart geoserver   # restart one service
```

| Symptom | Fix |
|---|---|
| A script says Docker is not running | Start Docker Desktop and wait for "Engine running" |
| GeoServer page doesn't load right after starting | Wait a minute; it boots slowly |
| A layer is empty or missing in Layer Preview | Run `03-Publish-GeoServer.ps1`, then `04-Test-Setup.ps1` |
| Something else is wrong | Run `.\scripts\Setup.ps1`; it's safe to run any time |

More in [SETUP.md, section 7](SETUP.md#7-troubleshooting).

---

## 7. Client and server (coming later)

These parts of the project don't exist yet. When they do, add here how to install
dependencies, run them in development, and build them.

### Server (NestJS)

_TODO: install, environment variables, `npm run start:dev`, port._

### Client (React PWA)

_TODO: install, `npm run dev`, port, how to test the PWA (install / offline)._
