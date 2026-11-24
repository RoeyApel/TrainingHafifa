import type { WfsFeature } from '../types/geo/types.js';
import type {
  TrainingArea,
  TrainingAreaAttributes,
} from '../types/training-areas/types.js';

export function toTrainingArea({
  properties,
}: WfsFeature<TrainingAreaAttributes>): TrainingArea {
  return {
    areaName: properties.area_name,
    trainingType: properties.training_type,
    status: properties.status,
  };
}
