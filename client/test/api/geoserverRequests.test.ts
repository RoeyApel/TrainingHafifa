import {
  AxiosError,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../src/api/api';
import {
  buildActiveFeaturesParams,
  buildFeaturesAtPointParams,
} from '../../src/mappers/wfsRequest';
import axiosInstance from '../../src/api/axiosInstance';
import { HttpError } from '../../src/api/httpError';
import {
  ACTIVE_FEATURES_FILTER,
  FORCES_LAYER,
  TRAINING_AREAS_LAYER,
} from '../../src/types/geoserver/types';
import { createWmsLayer } from '../../src/map/wmsLayer';
import { square } from '../fixtures';

describe('GeoServer requests', () => {
  it('asks WMS to leave out soft-deleted features', () => {
    const params: unknown = createWmsLayer(FORCES_LAYER, 0)
      .getSource()
      ?.getParams();

    expect(params).toMatchObject({
      LAYERS: 'imunim:force_deployment',
      CQL_FILTER: 'is_deleted = false',
    });
  });

  it('identifies by point with a WFS filter on the layer geometry', () => {
    const params = buildFeaturesAtPointParams(
      TRAINING_AREAS_LAYER,
      [713900.123, 3569200],
    );

    expect(params).toMatchObject({
      request: 'GetFeature',
      srsName: 'EPSG:32636',
      CQL_FILTER: `${ACTIVE_FEATURES_FILTER} AND INTERSECTS(geometry, POINT(713900.12 3569200.00))`,
    });
  });
});

describe('WFS requests', () => {
  it('lists every active feature of a layer, with no spatial filter', () => {
    expect(buildActiveFeaturesParams(FORCES_LAYER)).toMatchObject({
      request: 'GetFeature',
      typeNames: 'imunim:force_deployment',
      srsName: 'EPSG:32636',
      CQL_FILTER: ACTIVE_FEATURES_FILTER,
    });
  });
});

describe('forces API', () => {
  const adapter = vi.fn<AxiosAdapter>();
  const originalAdapter = axiosInstance.defaults.adapter;

  const respond = (status: number, data: unknown) => {
    adapter.mockImplementation((config: InternalAxiosRequestConfig) => {
      const response = {
        data,
        status,
        statusText: '',
        headers: {},
        config,
      };
      return status < 400
        ? Promise.resolve(response)
        : Promise.reject(
            new AxiosError('failed', undefined, config, null, response),
          );
    });
  };

  beforeEach(() => {
    axiosInstance.defaults.adapter = adapter;
  });

  afterEach(() => {
    axiosInstance.defaults.adapter = originalAdapter;
    adapter.mockReset();
  });

  it('posts the polygon in EPSG:32636 meters, not map coordinates', async () => {
    respond(200, { id: 9, outcome: 'approved', message: 'ok' });
    const attributes = {
      unitName: 'גדוד 50',
      commanderName: null,
      troopsCount: null,
      vehiclesCount: null,
      trainingDate: null,
    };

    const result = await api.forces().createForce(attributes, square());

    const [config] = adapter.mock.calls[0];
    expect(config.baseURL).toBe('/api');
    expect(config.url).toBe('/forces');
    expect(config.method).toBe('post');
    const body = JSON.parse(config.data as string) as {
      geom: { type: string; coordinates: number[][][] };
    };
    expect(body).toMatchObject({ ...attributes, geom: { type: 'Polygon' } });
    // 3,900,000 m east in Web Mercator is ~35°E: UTM 36N easting ~690 km.
    const [x, y] = body.geom.coordinates[0][0];
    expect(x).toBeGreaterThan(600_000);
    expect(x).toBeLessThan(800_000);
    expect(y).toBeGreaterThan(3_000_000);
    expect(result.id).toBe(9);
  });

  it("turns an error response into an HttpError with the server's message", async () => {
    respond(404, { statusCode: 404, message: 'Force 3 not found' });

    await expect(api.forces().deleteForce(3)).rejects.toEqual(
      new HttpError(404, 'Force 3 not found'),
    );
  });
});
