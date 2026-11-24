import { describe, expect, it } from '@jest/globals';
import { toTrainingArea } from '../../../src/mappers/training-area.mapper.js';
import {
  TrainingAreaStatus,
  TrainingType,
} from '../../../src/types/training-areas/enums.js';

describe('toTrainingArea', () => {
  it('maps GeoServer column names to the domain shape', () => {
    expect(
      toTrainingArea({
        id: 'training_areas.3',
        properties: {
          area_name: 'אש חיה 1',
          training_type: TrainingType.LiveFire,
          status: TrainingAreaStatus.Maintenance,
        },
      }),
    ).toEqual({
      areaName: 'אש חיה 1',
      trainingType: TrainingType.LiveFire,
      status: TrainingAreaStatus.Maintenance,
    });
  });
});
