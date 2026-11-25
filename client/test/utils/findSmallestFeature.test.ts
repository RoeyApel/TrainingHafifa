import Feature from 'ol/Feature';
import { Polygon } from 'ol/geom';
import { describe, expect, it } from 'vitest';
import { findSmallestFeature } from '../../src/utils/findSmallestFeature';

/** A square in map coordinates, `side` meters wide. */
const squareFeature = (side: number): Feature => {
  const x = 3_900_000;
  const y = 3_760_000;
  return new Feature(
    new Polygon([
      [
        [x, y],
        [x + side, y],
        [x + side, y + side],
        [x, y + side],
        [x, y],
      ],
    ]),
  );
};

describe('findSmallestFeature', () => {
  it('picks the polygon covering the least ground', () => {
    const large = squareFeature(1000);
    const small = squareFeature(100);
    const medium = squareFeature(400);

    expect(findSmallestFeature([large, small, medium])).toBe(small);
  });

  it('keeps the first of two equal polygons', () => {
    const first = squareFeature(100);
    const second = squareFeature(100);

    expect(findSmallestFeature([first, second])).toBe(first);
  });

  it('returns nothing for an empty list', () => {
    expect(findSmallestFeature([])).toBeUndefined();
  });
});
