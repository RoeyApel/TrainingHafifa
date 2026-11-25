export const GEOSERVER_WORKSPACE = 'imunim';

/**
 * Sent with every WMS and WFS request so GeoServer itself leaves out
 * soft-deleted features, instead of the client filtering them in JS.
 */
export const ACTIVE_FEATURES_FILTER = 'is_deleted = false';

/** Layer 1, שטחי אש ואימונים (from a GeoPackage). */
export const TRAINING_AREAS_LAYER: GeoServerLayer = {
  typeName: `${GEOSERVER_WORKSPACE}:training_areas`,
  geometryName: 'geometry',
};

/** Layer 2, פריסת כוחות (PostGIS table force_deployment). */
export const FORCES_LAYER: GeoServerLayer = {
  typeName: `${GEOSERVER_WORKSPACE}:force_deployment`,
  geometryName: 'geom',
};

export interface GeoServerLayer {
  typeName: string;
  geometryName: string;
}
