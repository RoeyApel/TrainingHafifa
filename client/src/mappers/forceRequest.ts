import GeoJSON from 'ol/format/GeoJSON';
import type { Polygon } from 'ol/geom';
import { DATA_PROJECTION, MAP_PROJECTION } from '../map/projections';
import type { ForceAttributes, ForceRequestBody } from '../types/forces/types';

const geoJson = new GeoJSON({
  dataProjection: DATA_PROJECTION,
  featureProjection: MAP_PROJECTION,
});

/** The API takes GeoJSON in EPSG:32636; the map edits in EPSG:3857. */
export const toForceRequestBody = (
  attributes: ForceAttributes,
  geometry: Polygon,
): ForceRequestBody => {
  return { ...attributes, geom: geoJson.writeGeometryObject(geometry) };
};
