import type Feature from 'ol/Feature';
import { getArea } from 'ol/sphere';
import { MAP_PROJECTION } from '../map/projections';

const areaOf = (feature: Feature): number => {
  const geometry = feature.getGeometry();
  return geometry
    ? getArea(geometry, { projection: MAP_PROJECTION })
    : Infinity;
};

/** The feature covering the least ground; the first one wins a tie. */
export const findSmallestFeature = (features: Feature[]): Feature | undefined =>
  features.reduce<Feature | undefined>(
    (smallest, feature) =>
      !smallest || areaOf(feature) < areaOf(smallest) ? feature : smallest,
    undefined,
  );
