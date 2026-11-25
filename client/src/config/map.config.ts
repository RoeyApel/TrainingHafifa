import type { Coordinate } from 'ol/coordinate';

/**
 * Lon/lat over the training areas, which are stored in EPSG:32636
 * (x 688,000-718,000, y 3,528,000-3,572,000).
 */
export const INITIAL_CENTER_LON_LAT: Coordinate = [35.15, 32.05];
/** Fits all the training areas on a laptop screen. */
export const INITIAL_ZOOM = 10;
export const MIN_ZOOM = 3;
/** The deepest zoom level OSM serves tiles for. */
export const MAX_ZOOM = 19;
/** Space kept around a polygon when the map zooms to it. */
export const FIT_PADDING_PX = 80;
/** A tiny polygon should not zoom in further than street level. */
export const FIT_MAX_ZOOM = 16;
export const FIT_DURATION_MS = 500;
