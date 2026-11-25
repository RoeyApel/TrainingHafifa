import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';

/** CRS of the GeoServer layers and of the server API (UTM 36N, meters). */
export const DATA_PROJECTION = 'EPSG:32636';
/** CRS of the map view: the projection OSM tiles are served in. */
export const MAP_PROJECTION = 'EPSG:3857';

const UTM_36N_DEFINITION =
  '+proj=utm +zone=36 +datum=WGS84 +units=m +no_defs +type=crs';

/** Call once, before any map is created. */
export const registerProjections = (): void => {
  proj4.defs(DATA_PROJECTION, UTM_36N_DEFINITION);
  register(proj4);
};
