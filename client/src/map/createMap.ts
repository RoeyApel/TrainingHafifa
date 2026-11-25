import OlMap from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import { MAP_PROJECTION } from './projections';
import {
  INITIAL_CENTER_LON_LAT,
  INITIAL_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
} from '../config/map.config';
import { createOsmLayer } from './osmLayer';

export const createMap = (): OlMap => {
  return new OlMap({
    layers: [createOsmLayer()],
    view: new View({
      projection: MAP_PROJECTION,
      center: fromLonLat(INITIAL_CENTER_LON_LAT),
      zoom: INITIAL_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
    }),
  });
};
