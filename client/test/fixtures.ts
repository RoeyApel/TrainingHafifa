import { Polygon } from 'ol/geom';
import type { Force } from '../src/types/forces/types';

/** A 100 m square in map coordinates (EPSG:3857). */
export const square = (): Polygon => {
  return new Polygon([
    [
      [3_900_000, 3_760_000],
      [3_900_100, 3_760_000],
      [3_900_100, 3_760_100],
      [3_900_000, 3_760_100],
      [3_900_000, 3_760_000],
    ],
  ]);
};

export const aForce = (overrides: Partial<Force> = {}): Force => {
  return {
    id: 7,
    unitName: 'גדוד 50',
    commanderName: 'רס"ן כהן',
    troopsCount: 120,
    vehiclesCount: 8,
    trainingDate: '2026-11-20',
    geometry: square(),
    ...overrides,
  };
};
