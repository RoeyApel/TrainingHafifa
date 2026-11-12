-- Inserts rows only when the table is empty, so re-running never duplicates them.
-- Coordinates are in meters (EPSG:32636), in the Negev.

INSERT INTO force_deployment
    (unit_name, troops_count, vehicles_count, commander_name, training_date, is_deleted, geom)
SELECT seed.*
FROM (VALUES
    ('גדוד 50', 120, 8, 'רס"ן כהן', DATE '2026-11-20', FALSE,
        ST_GeomFromText('POLYGON((672000 3408000, 673500 3408000, 673500 3409500, 672000 3409500, 672000 3408000))', 32636)),
    ('פלוגה ב', 40, 3, 'סרן לוי', DATE '2026-11-21', FALSE,
        ST_GeomFromText('POLYGON((675000 3410000, 676000 3410000, 676000 3411200, 675000 3411200, 675000 3410000))', 32636)),
    -- Soft-deleted on purpose: it must NOT appear in GeoServer (tests the CQL filter).
    ('יחידה מחוקה', 10, 0, 'סגן בדיקה', DATE '2026-11-22', TRUE,
        ST_GeomFromText('POLYGON((670000 3406000, 670800 3406000, 670800 3406800, 670000 3406800, 670000 3406000))', 32636))
) AS seed (unit_name, troops_count, vehicles_count, commander_name, training_date, is_deleted, geom)
WHERE NOT EXISTS (SELECT 1 FROM force_deployment);
