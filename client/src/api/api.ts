/* eslint-disable @typescript-eslint/explicit-module-boundary-types -- the group methods return object literals whose types are inferred from the typed request functions inside. */
import type { AxiosResponse } from 'axios';
import type Feature from 'ol/Feature';
import type { Coordinate } from 'ol/coordinate';
import GeoJSON from 'ol/format/GeoJSON';
import type { Polygon } from 'ol/geom';
import { toForceRequestBody } from '../mappers/forceRequest';
import {
  buildActiveFeaturesParams,
  buildFeaturesAtPointParams,
} from '../mappers/wfsRequest';
import { DATA_PROJECTION, MAP_PROJECTION } from '../map/projections';
import type { ForceAttributes, ForceSaveResult } from '../types/forces/types';
import {
  GEOSERVER_WORKSPACE,
  type GeoServerLayer,
} from '../types/geoserver/types';
import axiosInstance, { geoserverInstance } from './axiosInstance';

const WFS_PATH = `/${GEOSERVER_WORKSPACE}/ows`;

const geoJson = new GeoJSON({
  dataProjection: DATA_PROJECTION,
  featureProjection: MAP_PROJECTION,
});

const getData = async <T>(request: Promise<AxiosResponse<T>>): Promise<T> => {
  const result = await request;
  return result.data;
};

const deleteData = async (request: Promise<AxiosResponse>): Promise<void> => {
  await request;
};

export default {
  forces() {
    return {
      createForce: (
        attributes: ForceAttributes,
        geometry: Polygon,
      ): Promise<ForceSaveResult> =>
        getData(
          axiosInstance.post<ForceSaveResult>(
            '/forces',
            toForceRequestBody(attributes, geometry),
          ),
        ),

      updateForce: (
        id: number,
        attributes: ForceAttributes,
        geometry: Polygon,
      ): Promise<ForceSaveResult> =>
        getData(
          axiosInstance.patch<ForceSaveResult>(
            `/forces/${id}`,
            toForceRequestBody(attributes, geometry),
          ),
        ),

      deleteForce: (id: number): Promise<void> =>
        deleteData(axiosInstance.delete(`/forces/${id}`)),
    };
  },
  geoserver() {
    return {
      /** Every active feature of the layer, in MAP_PROJECTION. */
      getActiveFeatures: async (
        layer: GeoServerLayer,
        signal?: AbortSignal,
      ): Promise<Feature[]> => {
        const collection = await getData(
          geoserverInstance.get<unknown>(WFS_PATH, {
            params: buildActiveFeaturesParams(layer),
            signal,
          }),
        );
        return geoJson.readFeatures(collection);
      },

      /**
       * The layer's active features under a point given in DATA_PROJECTION.
       * Geometries come back in MAP_PROJECTION, ready to draw or edit.
       */
      getFeaturesAtPoint: async (
        layer: GeoServerLayer,
        point: Coordinate,
        signal?: AbortSignal,
      ): Promise<Feature[]> => {
        const collection = await getData(
          geoserverInstance.get<unknown>(WFS_PATH, {
            params: buildFeaturesAtPointParams(layer, point),
            signal,
          }),
        );
        return geoJson.readFeatures(collection);
      },
    };
  },
};
