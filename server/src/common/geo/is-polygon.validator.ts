import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';
import GeometryFactory from 'jsts/org/locationtech/jts/geom/GeometryFactory.js';
import GeoJSONReader from 'jsts/org/locationtech/jts/io/GeoJSONReader.js';
import IsValidOp from 'jsts/org/locationtech/jts/operation/valid/IsValidOp.js';
import type { Polygon } from 'typeorm';
import {
  MAX_POLYGON_POSITIONS,
  SRID,
  SRID_BOUNDS,
} from '../../types/geo/types.js';

/** A closed ring needs 3 distinct points plus the closing one. */
const MIN_RING_POSITIONS = 4;

type Position = [number, number];

const geoJsonReader = new GeoJSONReader(new GeometryFactory());

/**
 * Checks the shape first (cheap), then the topology with JTS, the engine
 * PostGIS's ST_IsValid is built on, so both layers agree on what is valid.
 */
export function IsPolygon(options?: ValidationOptions): PropertyDecorator {
  return (target, propertyName) =>
    registerDecorator({
      name: 'isPolygon',
      target: target.constructor,
      propertyName: String(propertyName),
      options,
      validator: {
        validate: (value: unknown) => findPolygonProblem(value) === undefined,
        defaultMessage: ({ property, value }: ValidationArguments) =>
          `${property} must be a valid GeoJSON Polygon in EPSG:${SRID}: ${findPolygonProblem(value)}`,
      },
    });
}

export function findPolygonProblem(value: unknown): string | undefined {
  return findShapeProblem(value) ?? findTopologyProblem(value as Polygon);
}

function findShapeProblem(value: unknown): string | undefined {
  if (!isRecord(value) || value.type !== 'Polygon') {
    return 'not a GeoJSON Polygon';
  }

  const rings = value.coordinates;
  if (!Array.isArray(rings) || rings.length === 0) {
    return 'coordinates must be a non-empty array of rings';
  }

  const positionCount = rings.reduce<number>(
    (count, ring) => count + (Array.isArray(ring) ? ring.length : 0),
    0,
  );
  if (positionCount > MAX_POLYGON_POSITIONS) {
    return `more than ${MAX_POLYGON_POSITIONS} positions`;
  }

  if (!rings.every(isRingOfPositionsInBounds)) {
    return `every ring needs at least ${MIN_RING_POSITIONS} [x, y] positions in meters, inside the bounds of EPSG:${SRID}`;
  }
  if (!rings.every(isClosed)) {
    return 'every ring must end at its first position';
  }
  return undefined;
}

function findTopologyProblem(polygon: Polygon): string | undefined {
  const validation = new IsValidOp(geoJsonReader.read(polygon));
  if (validation.isValid()) return undefined;

  const error = validation.getValidationError();
  // Not every JTS validation error has a location.
  const point = error.getCoordinate() as { x: number; y: number } | null;
  return point
    ? `${error.getMessage()} at (${point.x}, ${point.y})`
    : error.getMessage();
}

function isRingOfPositionsInBounds(ring: unknown): ring is Position[] {
  return (
    Array.isArray(ring) &&
    ring.length >= MIN_RING_POSITIONS &&
    ring.every(isPositionInBounds)
  );
}

function isClosed(ring: Position[]): boolean {
  const [firstX, firstY] = ring[0];
  const [lastX, lastY] = ring[ring.length - 1];
  return firstX === lastX && firstY === lastY;
}

function isPositionInBounds(position: unknown): position is Position {
  if (!Array.isArray(position) || position.length !== 2) return false;

  const [x, y] = position as unknown[];
  return (
    isFiniteNumber(x) &&
    isFiniteNumber(y) &&
    x >= SRID_BOUNDS.minX &&
    x <= SRID_BOUNDS.maxX &&
    y >= SRID_BOUNDS.minY &&
    y <= SRID_BOUNDS.maxY
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
