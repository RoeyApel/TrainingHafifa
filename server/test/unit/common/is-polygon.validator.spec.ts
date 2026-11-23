import { describe, expect, it } from '@jest/globals';
import { findPolygonProblem } from '../../../src/common/geo/is-polygon.validator.js';
import { MAX_POLYGON_POSITIONS } from '../../../src/types/geo/types.js';

type Ring = number[][];

// Rings are `unknown` so tests can also build malformed input.
const polygon = (...rings: unknown[][]) => ({
  type: 'Polygon',
  coordinates: rings,
});

const square: Ring = [
  [700000, 3550000],
  [701000, 3550000],
  [701000, 3551000],
  [700000, 3551000],
  [700000, 3550000],
];

describe('findPolygonProblem', () => {
  it('accepts a valid polygon in EPSG:32636', () => {
    expect(findPolygonProblem(polygon(square))).toBeUndefined();
  });

  it('accepts a polygon with a hole inside it', () => {
    const hole: Ring = [
      [700200, 3550200],
      [700400, 3550200],
      [700400, 3550400],
      [700200, 3550200],
    ];

    expect(findPolygonProblem(polygon(square, hole))).toBeUndefined();
  });

  describe('shape', () => {
    it.each([
      ['not an object', 'POLYGON((0 0))', 'not a GeoJSON Polygon'],
      [
        'another geometry type',
        { type: 'Point', coordinates: [700000, 3550000] },
        'not a GeoJSON Polygon',
      ],
      ['no rings', polygon(), 'non-empty array of rings'],
      [
        'a ring with fewer than 4 positions',
        polygon([square[0], square[1], square[0]]),
        'at least 4 [x, y] positions',
      ],
      [
        'longitude/latitude degrees',
        polygon([
          [34.8, 31.2],
          [34.9, 31.2],
          [34.9, 31.3],
          [34.8, 31.2],
        ]),
        'inside the bounds of EPSG:32636',
      ],
      [
        'a non-numeric coordinate',
        polygon([['700000', 3550000], ...square.slice(1)]),
        '[x, y] positions',
      ],
      [
        'an unclosed ring',
        polygon(square.slice(0, 4)),
        'end at its first position',
      ],
    ])('rejects %s', (_case, value, problem) => {
      expect(findPolygonProblem(value)).toContain(problem);
    });

    it(`rejects more than ${MAX_POLYGON_POSITIONS} positions`, () => {
      const tooMany = Array.from(
        { length: MAX_POLYGON_POSITIONS },
        () => square[1],
      );

      expect(
        findPolygonProblem(polygon([square[0], ...tooMany, square[0]])),
      ).toBe(`more than ${MAX_POLYGON_POSITIONS} positions`);
    });
  });

  describe('topology', () => {
    it('rejects a self-intersecting ("bow-tie") polygon', () => {
      const bowTie: Ring = [
        [700000, 3550000],
        [701000, 3550000],
        [700000, 3551000],
        [701000, 3551000],
        [700000, 3550000],
      ];

      expect(findPolygonProblem(polygon(bowTie))).toBe(
        'Self-intersection at (700500, 3550500)',
      );
    });

    it('rejects a hole outside its shell', () => {
      const farHole: Ring = [
        [710000, 3560000],
        [710100, 3560000],
        [710100, 3560100],
        [710000, 3560000],
      ];

      expect(findPolygonProblem(polygon(square, farHole))).toBe(
        'Hole lies outside shell at (710000, 3560000)',
      );
    });

    it('rejects a ring that collapses to a line', () => {
      const line: Ring = [square[0], square[1], square[1], square[0]];

      expect(findPolygonProblem(polygon(line))).toContain(
        'Too few distinct points',
      );
    });
  });
});
