import { describe, expect, it } from '@jest/globals';
import {
  toFeatureId,
  toForceId,
} from '../../../src/forces/force-feature.mapper.js';

describe('force feature ids', () => {
  it('round-trips an id through the GeoServer feature id', () => {
    expect(toFeatureId(7)).toBe('force_deployment.7');
    expect(toForceId('force_deployment.7')).toBe(7);
  });

  it.each([
    'force_deployment.',
    'force_deployment.0',
    'force_deployment.7a',
    'force_deployment.-7',
    'training_areas.7',
    'none',
  ])('returns undefined for the malformed feature id %p', (featureId) => {
    expect(toForceId(featureId)).toBeUndefined();
  });
});
