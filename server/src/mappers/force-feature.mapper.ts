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

/** Returns `undefined` when the feature id is not `force_deployment.<id>`. */
export function toForceId(featureId: string): number | undefined {
  const match = FEATURE_ID_PATTERN.exec(featureId);
  return match ? Number(match[1]) : undefined;
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
