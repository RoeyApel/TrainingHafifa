import { XMLBuilder } from 'fast-xml-parser';
import type { Polygon } from 'typeorm';
import {
  type FeatureProperties,
  type FeatureValue,
  SRS_NAME,
  WFS_SERVICE,
  WFS_VERSION,
  type WfsNamespace,
} from '../types/geo/types.js';

// XMLBuilder escapes every text and attribute value (& < > " '), so values
// from user input can't break or inject into the document.
const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  suppressEmptyNode: true,
});

const OGC_NAMESPACES = {
  '@_xmlns:wfs': 'http://www.opengis.net/wfs',
  '@_xmlns:ogc': 'http://www.opengis.net/ogc',
  '@_xmlns:gml': 'http://www.opengis.net/gml',
};

export function buildInsertTransaction(
  namespace: WfsNamespace,
  typeName: string,
  properties: FeatureProperties,
): string {
  // Null attributes are left out: an empty element is not null to GeoServer
  // (it fails to parse numbers and dates, and stores '' for text), while an
  // omitted attribute gets the column's default, NULL.
  const feature = Object.fromEntries(
    definedEntries(properties)
      .filter(([, value]) => value !== null)
      .map(([name, value]) => [
        `${namespace.prefix}:${name}`,
        toXmlValue(value),
      ]),
  );

  return buildTransaction(namespace, {
    'wfs:Insert': { [`${namespace.prefix}:${typeName}`]: feature },
  });
}

export function buildUpdateTransaction(
  namespace: WfsNamespace,
  typeName: string,
  featureId: string,
  properties: FeatureProperties,
): string {
  // A wfs:Property without a wfs:Value sets the attribute to null.
  const updatedProperties = definedEntries(properties).map(([name, value]) => ({
    'wfs:Name': name,
    ...(value !== null && { 'wfs:Value': toXmlValue(value) }),
  }));

  return buildTransaction(namespace, {
    'wfs:Update': {
      '@_typeName': `${namespace.prefix}:${typeName}`,
      'wfs:Property': updatedProperties,
      'ogc:Filter': { 'ogc:FeatureId': { '@_fid': featureId } },
    },
  });
}

function buildTransaction(
  namespace: WfsNamespace,
  operation: Record<string, unknown>,
): string {
  return xmlBuilder.build({
    'wfs:Transaction': {
      '@_service': WFS_SERVICE,
      '@_version': WFS_VERSION,
      ...OGC_NAMESPACES,
      [`@_xmlns:${namespace.prefix}`]: namespace.uri,
      ...operation,
    },
  });
}

function definedEntries(
  properties: FeatureProperties,
): [string, FeatureValue][] {
  return Object.entries(properties).filter(
    (entry): entry is [string, FeatureValue] => entry[1] !== undefined,
  );
}

function toXmlValue(value: FeatureValue): unknown {
  return isPolygon(value) ? polygonToGml(value) : value;
}

function isPolygon(value: FeatureValue): value is Polygon {
  return typeof value === 'object' && value?.type === 'Polygon';
}

/** The first ring is the outer boundary, the rest are holes. */
function polygonToGml({ coordinates }: Polygon): Record<string, unknown> {
  const [exterior, ...interiors] = coordinates.map((ring) => ({
    'gml:LinearRing': {
      'gml:posList': ring.map(([x, y]) => `${x} ${y}`).join(' '),
    },
  }));

  return {
    'gml:Polygon': {
      '@_srsName': SRS_NAME,
      'gml:exterior': exterior,
      ...(interiors.length > 0 && { 'gml:interior': interiors }),
    },
  };
}
