import { describe, expect, it } from 'vitest';
import { toFootprintPath } from '../../src/utils/footprintPath';
import { square } from '../fixtures';

describe('toFootprintPath', () => {
  it('fits a square to the box, with north up', () => {
    const [ring] = square().getCoordinates();

    expect(toFootprintPath(ring, 32)).toBe(
      'M0.0,32.0L32.0,32.0L32.0,0.0L0.0,0.0L0.0,32.0Z',
    );
  });

  it('keeps the proportions and centers the shorter side', () => {
    const wide = [
      [0, 0],
      [200, 0],
      [200, 100],
      [0, 100],
      [0, 0],
    ];

    expect(toFootprintPath(wide, 32)).toBe(
      'M0.0,24.0L32.0,24.0L32.0,8.0L0.0,8.0L0.0,24.0Z',
    );
  });

  it('does not divide by zero for a shape with no extent', () => {
    const point = [
      [5, 5],
      [5, 5],
    ];

    expect(toFootprintPath(point, 32)).not.toContain('NaN');
  });
});
