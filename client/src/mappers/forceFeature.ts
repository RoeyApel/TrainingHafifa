import type Feature from 'ol/Feature';
import { Polygon } from 'ol/geom';
import { z } from 'zod';
import { parseFeatureId } from './featureId';
import type { Force } from '../types/forces/types';

/** GeoServer writes xsd:date values with a UTC marker: `2026-11-20Z`. */
const dateOnly = z
  .string()
  .transform((value) => value.replace(/Z$/, ''))
  .nullable();

const propertiesSchema = z.object({
  unit_name: z.string(),
  commander_name: z.string().nullable(),
  troops_count: z.number().int().nullable(),
  vehicles_count: z.number().int().nullable(),
  training_date: dateOnly,
});

export const toForce = (feature: Feature): Force => {
  const properties = propertiesSchema.parse(feature.getProperties());
  const geometry = feature.getGeometry();
  if (!(geometry instanceof Polygon)) {
    throw new Error(`Force ${String(feature.getId())} has no polygon`);
  }
  return {
    id: parseFeatureId(feature),
    unitName: properties.unit_name,
    commanderName: properties.commander_name,
    troopsCount: properties.troops_count,
    vehiclesCount: properties.vehicles_count,
    trainingDate: properties.training_date,
    geometry,
  };
};
