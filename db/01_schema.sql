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

-- No self-intersecting or otherwise invalid polygons, whoever writes them.
-- Added separately so it also reaches tables created before it existed
-- (Postgres has no ADD CONSTRAINT IF NOT EXISTS). A NULL geometry passes.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_force_deployment_geom_valid'
          AND conrelid = 'force_deployment'::regclass
    ) THEN
        ALTER TABLE force_deployment
            ADD CONSTRAINT chk_force_deployment_geom_valid CHECK (ST_IsValid(geom));
    END IF;
END
$$;
