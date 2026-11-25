import { unByKey } from 'ol/Observable';
import { useEffect, useEffectEvent } from 'react';
import { useMap } from './useMap';

/** Calls `onZoom` whenever the map zooms in or out (not on panning). */
export const useMapZoom = (onZoom: () => void): void => {
  const map = useMap();
  const handleZoom = useEffectEvent(() => {
    onZoom();
  });

  useEffect(() => {
    const key = map.getView().on('change:resolution', handleZoom);
    return () => {
      unByKey(key);
    };
  }, [map]);
};
