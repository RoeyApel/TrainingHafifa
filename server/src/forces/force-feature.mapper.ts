import type { FeatureProperties } from '../types/geo/types.js';
import {
  type UpdateForceDto,
  FORCES_TYPE_NAME,
} from '../types/forces/types.js';

const FEATURE_ID_PATTERN = new RegExp(`^${FORCES_TYPE_NAME}\\.([1-9]\\d*)$`);

/** GeoServer feature ids are `<typeName>.<primary key>`. */
export function toFeatureId(id: number): string {
  return `${FORCES_TYPE_NAME}.${id}`;
}

export function toForceId(featureId: string): number {
  const match = FEATURE_ID_PATTERN.exec(featureId);
  if (!match) {
    throw new Error(`Unexpected force feature id: ${featureId}`);
  }
  return Number(match[1]);
}

/** Fields left `undefined` are omitted, so an edit only touches what changed. */
export function toFeatureProperties(force: UpdateForceDto): FeatureProperties {
  return {
    unit_name: force.unitName,
    troops_count: force.troopsCount,
    vehicles_count: force.vehiclesCount,
    commander_name: force.commanderName,
    training_date: force.trainingDate,
    geom: force.geom,
  };
}
