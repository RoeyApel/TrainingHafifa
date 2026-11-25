import type OlMap from 'ol/Map';
import { useContext } from 'react';
import { MapContext } from '../contexts/MapContext';

export const useMap = (): OlMap => {
  const map = useContext(MapContext);
  if (!map) {
    throw new Error('useMap must be used inside <MapProvider>');
  }
  return map;
};
