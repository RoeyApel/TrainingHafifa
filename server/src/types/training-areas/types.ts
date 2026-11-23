import type { TrainingAreaStatus, TrainingType } from './enums.js';

/**
 * Layer 1 (שטחי אש ואימונים): static polygons from the GeoPackage that
 * GeoServer publishes as `imunim:training_areas`.
 */
export const TRAINING_AREAS_TYPE_NAME = 'training_areas';

/** Name of the geometry attribute in the GeoPackage. */
export const TRAINING_AREAS_GEOMETRY = 'geometry';

export interface TrainingArea {
  areaName: string;
  trainingType: TrainingType;
  status: TrainingAreaStatus;
}
