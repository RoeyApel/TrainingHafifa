-- =============================================================================
-- Schema for layer 2: force deployment (פריסת כוחות מתאמנים).
-- Safe to run more than once: every statement skips objects that already exist.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS force_deployment (
    id              SERIAL PRIMARY KEY,
    unit_name       VARCHAR(100) NOT NULL,           -- שם היחידה
    troops_count    INTEGER,                         -- סד"כ: number of fighters
    vehicles_count  INTEGER,                         -- סד"כ: number of vehicles
    commander_name  VARCHAR(100),                    -- שם מפקד האימון
    training_date   DATE,                            -- תאריך האימון
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,  -- soft delete flag
    geom            geometry(Polygon, 32636)         -- locked to EPSG:32636 (UTM 36N)
);

-- Spatial index: keeps "which features are in this map extent?" queries fast.
CREATE INDEX IF NOT EXISTS idx_force_deployment_geom
    ON force_deployment USING GIST (geom);
