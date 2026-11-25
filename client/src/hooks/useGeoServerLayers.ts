import { useCallback, useEffect, useState } from 'react';
import { FORCES_LAYER, TRAINING_AREAS_LAYER } from '../types/geoserver/types';
import { createWmsLayer, refreshWmsLayer } from '../map/wmsLayer';
import { useMap } from './useMap';

/** Forces are drawn above the training areas they are placed in. */
const TRAINING_AREAS_Z_INDEX = 10;
const FORCES_Z_INDEX = 20;

export interface GeoServerLayers {
  refreshForces: () => void;
}

export const useGeoServerLayers = (): GeoServerLayers => {
  const map = useMap();
  const [trainingAreas] = useState(() =>
    createWmsLayer(TRAINING_AREAS_LAYER, TRAINING_AREAS_Z_INDEX),
  );
  const [forces] = useState(() => createWmsLayer(FORCES_LAYER, FORCES_Z_INDEX));

  useEffect(() => {
    map.addLayer(trainingAreas);
    map.addLayer(forces);
    return () => {
      map.removeLayer(trainingAreas);
      map.removeLayer(forces);
    };
  }, [map, trainingAreas, forces]);

  const refreshForces = useCallback(() => {
    refreshWmsLayer(forces);
  }, [forces]);

  return { refreshForces };
};
