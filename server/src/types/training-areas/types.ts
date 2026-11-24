import type { TrainingAreaStatus, TrainingType } from './enums.js';

/**
 * Layer 1 (שטחי אש ואימונים): static polygons from the GeoPackage that
 * GeoServer publishes as `imunim:training_areas`.
 */
export const TRAINING_AREAS_TYPE_NAME = 'training_areas';

/** Name of the geometry attribute in the GeoPackage. */
export const TRAINING_AREAS_GEOMETRY = 'geometry';

/** A training area's attributes as GeoServer returns them (column names). */
export interface TrainingAreaAttributes {
  area_name: string;
  training_type: TrainingType;
  status: TrainingAreaStatus;
}

export interface TrainingArea {
  areaName: string;
  trainingType: TrainingType;
  status: TrainingAreaStatus;
}
