import { describe, expect, it } from '@jest/globals';
import {
  parseFeatureCollection,
  parseTransactionResponse,
  WfsError,
} from '../../../src/geoserver/wfs-response.parser.js';

const exceptionReport = `<ows:ExceptionReport xmlns:ows="http://www.opengis.net/ows" version="1.0.0">
  <ows:Exception exceptionCode="InvalidParameterValue">
    <ows:ExceptionText>No such property: no_such_col</ows:ExceptionText>
  </ows:Exception>
</ows:ExceptionReport>`;

// Trimmed copies of real GeoServer 2.26 responses.
const transactionResponse = (summary: string, insertResults: string): string =>
  `<?xml version="1.0" encoding="UTF-8"?>
  <wfs:TransactionResponse xmlns:wfs="http://www.opengis.net/wfs" xmlns:ogc="http://www.opengis.net/ogc" version="1.1.0">
    <wfs:TransactionSummary>${summary}</wfs:TransactionSummary>
    <wfs:TransactionResults/>
    <wfs:InsertResults>${insertResults}</wfs:InsertResults>
  </wfs:TransactionResponse>`;

describe('parseTransactionResponse', () => {
  it('reads the inserted feature id', () => {
    const xml = transactionResponse(
      '<wfs:totalInserted>1</wfs:totalInserted><wfs:totalUpdated>0</wfs:totalUpdated>',
      '<wfs:Feature><ogc:FeatureId fid="force_deployment.7"/></wfs:Feature>',
    );

    expect(parseTransactionResponse(xml)).toEqual({
      totalInserted: 1,
      totalUpdated: 0,
      insertedFeatureIds: ['force_deployment.7'],
    });
  });

  it("ignores GeoServer's 'none' placeholder when nothing was inserted", () => {
    const xml = transactionResponse(
      '<wfs:totalInserted>0</wfs:totalInserted><wfs:totalUpdated>1</wfs:totalUpdated>',
      '<wfs:Feature><ogc:FeatureId fid="none"/></wfs:Feature>',
    );

    expect(parseTransactionResponse(xml)).toEqual({
      totalInserted: 0,
      totalUpdated: 1,
      insertedFeatureIds: [],
    });
  });

  it('throws the exception text of an ExceptionReport', () => {
    expect(() => parseTransactionResponse(exceptionReport)).toThrow(
      new WfsError('InvalidParameterValue: No such property: no_such_col'),
    );
  });

  it('rejects a document that is not a transaction response', () => {
    expect(() => parseTransactionResponse('<html>Login</html>')).toThrow(
      WfsError,
    );
  });
});

describe('parseFeatureCollection', () => {
  it('returns the features of a GeoJSON FeatureCollection', () => {
    const body = JSON.stringify({
      type: 'FeatureCollection',
      features: [{ id: 'training_areas.1', properties: { status: 'active' } }],
    });

    expect(parseFeatureCollection(body)).toEqual([
      { id: 'training_areas.1', properties: { status: 'active' } },
    ]);
  });

  it('throws the exception text when GeoServer answers with XML', () => {
    expect(() => parseFeatureCollection(exceptionReport)).toThrow(
      new WfsError('InvalidParameterValue: No such property: no_such_col'),
    );
  });

  it.each([
    ['non-JSON text', 'Internal error'],
    ['JSON without features', '{"type":"FeatureCollection"}'],
    ['a JSON null', 'null'],
  ])('rejects %s', (_case, body) => {
    expect(() => parseFeatureCollection(body)).toThrow(WfsError);
  });
});
