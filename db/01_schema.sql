-- Safe to run more than once: every statement skips objects that already exist.

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS force_deployment (
    id              SERIAL PRIMARY KEY,
    unit_name       VARCHAR(100) NOT NULL,
    troops_count    INTEGER,
    vehicles_count  INTEGER,
    commander_name  VARCHAR(100),
    training_date   DATE,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    geom            geometry(Polygon, 32636)
);

-- Keeps GeoServer's "which features are in this map extent?" queries fast.
CREATE INDEX IF NOT EXISTS idx_force_deployment_geom
    ON force_deployment USING GIST (geom);
