import type { Polygon } from 'typeorm';
import { SRID } from '../../types/geo/types.js';

/**
 * GeoJSON Polygon → EWKT, e.g. `SRID=32636;POLYGON((x y, ...))`,
 * the geometry literal GeoServer's ECQL filters accept.
 */
export function polygonToEwkt({ coordinates }: Polygon): string {
  const rings = coordinates
    .map((ring) => `(${ring.map(([x, y]) => `${x} ${y}`).join(', ')})`)
    .join(', ');

  return `SRID=${SRID};POLYGON(${rings})`;
}
