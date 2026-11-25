import type { Coordinate } from 'ol/coordinate';
import { DATA_PROJECTION } from '../map/projections';
import {
  ACTIVE_FEATURES_FILTER,
  type GeoServerLayer,
} from '../types/geoserver/types';

/** Centimeters: finer than any polygon edge, short enough for a URL. */
const COORDINATE_DECIMALS = 2;

const buildGetFeatureParams = (
  layer: GeoServerLayer,
  cqlFilter: string,
): Record<string, string> => {
  return {
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeNames: layer.typeName,
    outputFormat: 'application/json',
    srsName: DATA_PROJECTION,
    CQL_FILTER: cqlFilter,
  };
};

export const buildActiveFeaturesParams = (
  layer: GeoServerLayer,
): Record<string, string> => {
  return buildGetFeatureParams(layer, ACTIVE_FEATURES_FILTER);
};

export const buildFeaturesAtPointParams = (
  layer: GeoServerLayer,
  point: Coordinate,
): Record<string, string> => {
  const [x, y] = point.map((value) => value.toFixed(COORDINATE_DECIMALS));
  return buildGetFeatureParams(
    layer,
    `${ACTIVE_FEATURES_FILTER} AND INTERSECTS(${layer.geometryName}, POINT(${x} ${y}))`,
  );
};
