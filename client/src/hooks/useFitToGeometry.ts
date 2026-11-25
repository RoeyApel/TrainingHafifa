import type { Polygon } from 'ol/geom';
import { useCallback } from 'react';
import {
  FIT_DURATION_MS,
  FIT_MAX_ZOOM,
  FIT_PADDING_PX,
} from '../config/map.config';
import { useMap } from './useMap';

export const useFitToGeometry = (): ((geometry: Polygon) => void) => {
  const map = useMap();

  return useCallback(
    (geometry: Polygon) => {
      map.getView().fit(geometry, {
        padding: [
          FIT_PADDING_PX,
          FIT_PADDING_PX,
          FIT_PADDING_PX,
          FIT_PADDING_PX,
        ],
        maxZoom: FIT_MAX_ZOOM,
        duration: FIT_DURATION_MS,
      });
    },
    [map],
  );
};
