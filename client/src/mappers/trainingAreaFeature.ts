import type Feature from 'ol/Feature';
import { z } from 'zod';
import { parseFeatureId } from './featureId';
import {
  TrainingAreaStatus,
  TrainingType,
} from '../types/training-areas/enums';
import type { TrainingArea } from '../types/training-areas/types';

const propertiesSchema = z.object({
  area_name: z.string(),
  training_type: z.enum(TrainingType),
  status: z.enum(TrainingAreaStatus),
});

export const toTrainingArea = (feature: Feature): TrainingArea => {
  const properties = propertiesSchema.parse(feature.getProperties());
  return {
    id: parseFeatureId(feature),
    areaName: properties.area_name,
    trainingType: properties.training_type,
    status: properties.status,
  };
};
