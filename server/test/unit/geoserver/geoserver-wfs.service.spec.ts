import { afterAll, afterEach, describe, expect, it, jest } from '@jest/globals';
import { BadGatewayException, GatewayTimeoutException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { GeoServerWfsService } from '../../../src/geoserver/geoserver-wfs.service.js';
import type { EnvironmentVariables } from '../../../src/types/config/types.js';

const env: Partial<EnvironmentVariables> = {
  GEOSERVER_URL: 'http://localhost:8080/geoserver',
  GEOSERVER_WORKSPACE: 'imunim',
  GEOSERVER_USERNAME: 'admin',
  GEOSERVER_PASSWORD: 'geoserver',
  GEOSERVER_NAMESPACE_URI: 'http://imunim',
};

const config = {
  get: (key: keyof EnvironmentVariables) => env[key],
} as unknown as ConfigService<EnvironmentVariables, true>;

describe('GeoServerWfsService', () => {
  const service = new GeoServerWfsService(config);
  const fetchMock = jest.spyOn(globalThis, 'fetch');

  afterEach(() => {
    fetchMock.mockReset();
  });

  afterAll(() => {
    fetchMock.mockRestore();
  });

  it('reports a timed-out write as 504, warning that it may have been saved', async () => {
    fetchMock.mockRejectedValue(
      new DOMException('The operation timed out.', 'TimeoutError'),
    );

    const update = service.updateFeature(
      'force_deployment',
      'force_deployment.7',
      {
        is_deleted: true,
      },
    );

    await expect(update).rejects.toThrow(GatewayTimeoutException);
    await expect(update).rejects.toThrow(/may have been saved/);
  });

  it('reports a refused connection as 502', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    await expect(
      service.getFeatures('training_areas', {
        cqlFilter: 'is_deleted = false',
        propertyNames: ['status'],
      }),
    ).rejects.toThrow(BadGatewayException);
  });
});
