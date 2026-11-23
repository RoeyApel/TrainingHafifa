import { XMLParser } from 'fast-xml-parser';
import type { TransactionSummary, WfsFeature } from '../types/geo/types.js';

/** GeoServer rejected a request, or answered with something unexpected. */
export class WfsError extends Error {
  override readonly name = 'WfsError';
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  removeNSPrefix: true,
  // Elements that may repeat are always arrays, even with a single child.
  isArray: (name) => ['Feature', 'FeatureId', 'Exception'].includes(name),
});

interface ParsedResponse {
  ExceptionReport?: {
    Exception: { exceptionCode?: string; ExceptionText?: string }[];
  };
  TransactionResponse?: {
    TransactionSummary?: { totalInserted?: number; totalUpdated?: number };
    InsertResults?: { Feature?: { FeatureId: { fid: string }[] }[] };
  };
}

/** GeoServer's placeholder fid in InsertResults when nothing was inserted. */
const NO_FEATURE_ID = 'none';

/** @throws WfsError on an ExceptionReport or an unrecognised document. */
export function parseTransactionResponse(xml: string): TransactionSummary {
  const document = parseXml(xml);

  if (document.ExceptionReport) {
    throw new WfsError(describeExceptions(document.ExceptionReport));
  }

  const response = document.TransactionResponse;
  if (!response?.TransactionSummary) {
    throw new WfsError('GeoServer returned an unrecognised WFS-T response');
  }

  const insertedFeatureIds = (response.InsertResults?.Feature ?? [])
    .flatMap((feature) => feature.FeatureId)
    .map(({ fid }) => fid)
    .filter((fid) => fid !== NO_FEATURE_ID);

  return {
    totalInserted: response.TransactionSummary.totalInserted ?? 0,
    totalUpdated: response.TransactionSummary.totalUpdated ?? 0,
    insertedFeatureIds,
  };
}

/**
 * On errors GeoServer answers with an XML ExceptionReport even though GeoJSON
 * was requested.
 *
 * @throws WfsError on an ExceptionReport or anything but a FeatureCollection.
 */
export function parseFeatureCollection<TProperties>(
  body: string,
): WfsFeature<TProperties>[] {
  let collection: unknown;
  try {
    collection = JSON.parse(body);
  } catch {
    const report = safeParseXml(body)?.ExceptionReport;
    throw new WfsError(
      report
        ? describeExceptions(report)
        : 'GeoServer returned a non-JSON GetFeature response',
    );
  }

  if (!isFeatureCollection(collection)) {
    throw new WfsError(
      'GeoServer returned an unrecognised GetFeature response',
    );
  }
  return collection.features as WfsFeature<TProperties>[];
}

function isFeatureCollection(value: unknown): value is { features: unknown[] } {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as { features?: unknown }).features)
  );
}

function parseXml(xml: string): ParsedResponse {
  const document = safeParseXml(xml);
  if (!document) {
    throw new WfsError('GeoServer returned a response that is not XML');
  }
  return document;
}

function safeParseXml(xml: string): ParsedResponse | undefined {
  try {
    return xmlParser.parse(xml) as ParsedResponse;
  } catch {
    return undefined;
  }
}

function describeExceptions(
  report: NonNullable<ParsedResponse['ExceptionReport']>,
): string {
  return report.Exception.map(
    ({ exceptionCode, ExceptionText }) =>
      `${exceptionCode ?? 'Exception'}: ${ExceptionText ?? 'no details'}`,
  ).join('; ');
}
