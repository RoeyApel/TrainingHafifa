import Feature from 'ol/Feature';
import { type Geometry, Point } from 'ol/geom';
import { describe, expect, it } from 'vitest';
import { toForce } from '../../src/mappers/forceFeature';
import { toTrainingArea } from '../../src/mappers/trainingAreaFeature';
import { square } from '../fixtures';

const featureWith = (
  id: string,
  properties: Record<string, unknown>,
  geometry: Geometry = square(),
): Feature => {
  const feature = new Feature({ ...properties, geometry });
  feature.setId(id);
  return feature;
};

const forceColumns = {
  unit_name: 'גדוד 50',
  commander_name: null,
  troops_count: 120,
  vehicles_count: null,
  training_date: '2026-11-20Z',
  is_deleted: false,
};

describe('toForce', () => {
  it('maps GeoServer columns, the feature id and the xsd:date value', () => {
    const force = toForce(featureWith('force_deployment.7', forceColumns));

    expect(force).toMatchObject({
      id: 7,
      unitName: 'גדוד 50',
      commanderName: null,
      troopsCount: 120,
      vehiclesCount: null,
      trainingDate: '2026-11-20',
    });
  });

  it('rejects a feature whose columns do not match the layer', () => {
    expect(() =>
      toForce(featureWith('force_deployment.7', { unit_name: 5 })),
    ).toThrow();
  });

  it('rejects a feature without a polygon', () => {
    expect(() =>
      toForce(
        featureWith('force_deployment.7', forceColumns, new Point([0, 0])),
      ),
    ).toThrow(/no polygon/);
  });
});

describe('toTrainingArea', () => {
  it('maps GeoServer columns to the domain shape', () => {
    const area = toTrainingArea(
      featureWith('training_areas.2', {
        area_name: 'לייזר 1',
        training_type: 'laser',
        status: 'maintenance',
      }),
    );

    expect(area).toEqual({
      id: 2,
      areaName: 'לייזר 1',
      trainingType: 'laser',
      status: 'maintenance',
    });
  });

  it('rejects an unknown training type', () => {
    expect(() =>
      toTrainingArea(
        featureWith('training_areas.2', {
          area_name: 'x',
          training_type: 'swimming',
          status: 'active',
        }),
      ),
    ).toThrow();
  });
});
