import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '../types/config/types.js';
import {
  type FeatureProperties,
  type GetFeaturesQuery,
  SRS_NAME,
  type TransactionSummary,
  type WfsFeature,
  type WfsNamespace,
} from '../types/geo/types.js';
import {
  buildInsertTransaction,
  buildUpdateTransaction,
} from './wfs-transaction.builder.js';
import {
  parseFeatureCollection,
  parseTransactionResponse,
  WfsError,
} from './wfs-response.parser.js';

const REQUEST_TIMEOUT_MS = 10_000;

interface UpstreamResponse {
  status: number;
  body: string;
}

/**
 * Client for the workspace's WFS endpoint.
 *
 * Writes use WFS-T (transactional WFS); this is the only place the server
 * writes features. Failures surface as 502 Bad Gateway, since the fault is
 * upstream of this API.
 */
@Injectable()
export class GeoServerWfsService {
  private readonly logger = new Logger(GeoServerWfsService.name);

  readonly wfsUrl: string;
  private readonly namespace: WfsNamespace;
  private readonly authorization: string;

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    const baseUrl = config.get('GEOSERVER_URL', { infer: true });
    const workspace = config.get('GEOSERVER_WORKSPACE', { infer: true });
    const username = config.get('GEOSERVER_USERNAME', { infer: true });
    const password = config.get('GEOSERVER_PASSWORD', { infer: true });

    this.wfsUrl = `${baseUrl.replace(/\/+$/, '')}/${workspace}/wfs`;
    this.namespace = {
      prefix: workspace,
      uri: config.get('GEOSERVER_NAMESPACE_URI', { infer: true }),
    };
    this.authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  }

  async insertFeature(
    typeName: string,
    properties: FeatureProperties,
  ): Promise<string> {
    const xml = buildInsertTransaction(this.namespace, typeName, properties);
    const { insertedFeatureIds } = await this.transact(xml);

    const [featureId] = insertedFeatureIds;
    if (!featureId) {
      throw this.upstreamError('GeoServer did not report the inserted feature');
    }
    return featureId;
  }

  /** Returns how many features GeoServer changed (0 when the id is gone). */
  async updateFeature(
    typeName: string,
    featureId: string,
    properties: FeatureProperties,
  ): Promise<number> {
    const xml = buildUpdateTransaction(
      this.namespace,
      typeName,
      featureId,
      properties,
    );
    const { totalUpdated } = await this.transact(xml);
    return totalUpdated;
  }

  async getFeatures<TProperties>(
    typeName: string,
    query: GetFeaturesQuery,
  ): Promise<WfsFeature<TProperties>[]> {
    // Sent as a form POST, not a GET query string: a filter holding a
    // detailed polygon is longer than GeoServer accepts in a URL.
    const form = new URLSearchParams({
      service: 'WFS',
      version: '1.1.0',
      request: 'GetFeature',
      typeName: `${this.namespace.prefix}:${typeName}`,
      srsName: SRS_NAME,
      outputFormat: 'application/json',
      propertyName: query.propertyNames.join(','),
      cql_filter: query.cqlFilter,
    });

    const response = await this.request({ method: 'POST', body: form });
    return this.parseOrThrow(response, 'WFS GetFeature failed', (body) =>
      parseFeatureCollection<TProperties>(body),
    );
  }

  private async transact(xml: string): Promise<TransactionSummary> {
    const response = await this.request({
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: xml,
    });
    return this.parseOrThrow(
      response,
      'WFS-T transaction was rejected',
      parseTransactionResponse,
    );
  }

  /**
   * Sends a request and reads the whole body. The timeout covers the body
   * too, so a stalled response is reported like an unreachable server.
   */
  private async request(init: RequestInit): Promise<UpstreamResponse> {
    try {
      const response = await fetch(this.wfsUrl, {
        ...init,
        headers: { ...init.headers, Authorization: this.authorization },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      return { status: response.status, body: await response.text() };
    } catch (error) {
      throw this.upstreamError('GeoServer is unreachable', String(error));
    }
  }

  /**
   * GeoServer may report an error with HTTP 200, so the body decides; the
   * status is only added to the logged details.
   */
  private parseOrThrow<T>(
    response: UpstreamResponse,
    message: string,
    parse: (body: string) => T,
  ): T {
    try {
      return parse(response.body);
    } catch (error) {
      if (error instanceof WfsError) {
        throw this.upstreamError(
          message,
          `HTTP ${response.status}: ${error.message}`,
        );
      }
      throw error;
    }
  }

  /** Logs the details server-side; the client only gets a generic message. */
  private upstreamError(
    message: string,
    details?: string,
  ): BadGatewayException {
    this.logger.error({ details: details?.slice(0, 500) }, message);
    return new BadGatewayException(message);
  }
}
