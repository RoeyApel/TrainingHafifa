import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '../config/env.validation.js';

/**
 * Client for GeoServer's WFS-T (transactional WFS) endpoint.
 * All writes to force polygons go through here, not through TypeORM.
 *
 * TODO:
 * - insert a force feature            (wfs:Insert)
 * - update a force feature            (wfs:Update)
 * - soft-delete a force feature       (wfs:Update setting is_deleted = true;
 *                                      never wfs:Delete)
 * - parse the TransactionResponse and surface GeoServer errors
 */
@Injectable()
export class GeoServerWfsService {
  /** e.g. http://localhost:8080/geoserver/imunim/wfs */
  readonly wfsUrl: string;

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    const baseUrl = config.get('GEOSERVER_URL', { infer: true });
    const workspace = config.get('GEOSERVER_WORKSPACE', { infer: true });
    this.wfsUrl = `${baseUrl.replace(/\/+$/, '')}/${workspace}/wfs`;
  }
}
