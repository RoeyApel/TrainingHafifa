import type { Polygon } from 'typeorm';

/**
 * Every geometry in the project is stored and exchanged in
 * WGS 84 / UTM zone 36N (units: meters).
 */
export const SRID = 32636;

export const SRS_NAME = `EPSG:${SRID}`;

/**
 * Projected bounds of EPSG:32636 (meters). A coordinate outside them is almost
 * always longitude/latitude in degrees sent by mistake.
 */
export const SRID_BOUNDS = {
  minX: 166_021.44,
  maxX: 833_978.56,
  minY: 0,
  maxY: 9_329_005.18,
} as const;

/** Every WFS request (reads and WFS-T writes) uses this protocol version. */
export const WFS_SERVICE = 'WFS';
export const WFS_VERSION = '1.1.0';

/** Keeps requests to GeoServer a reasonable size. */
export const MAX_POLYGON_POSITIONS = 5_000;

/** A value GeoServer can store in a feature attribute. */
export type FeatureValue = string | number | boolean | null | Polygon;

/**
 * Attributes of a feature, keyed by the GeoServer property (column) name.
 * `undefined` means "leave untouched" and is never sent; `null` clears it.
 */
export type FeatureProperties = Record<string, FeatureValue | undefined>;

/** The XML namespace of the GeoServer workspace, e.g. imunim → http://imunim. */
export interface WfsNamespace {
  prefix: string;
  uri: string;
}

export interface TransactionSummary {
  totalInserted: number;
  totalUpdated: number;
  /** Feature ids of inserted features, e.g. `force_deployment.7`. */
  insertedFeatureIds: string[];
}

export interface WfsFeature<TProperties> {
  /** Feature id, e.g. `training_areas.3`. */
  id: string;
  properties: TProperties;
}

export interface GetFeaturesQuery {
  /** GeoServer (E)CQL filter, e.g. `status = 'active'`. */
  cqlFilter: string;
  /** Attributes to return; omit the geometry when it isn't needed. */
  propertyNames: string[];
}
