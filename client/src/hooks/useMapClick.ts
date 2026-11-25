import type { Coordinate } from 'ol/coordinate';
import { unByKey } from 'ol/Observable';
import { useEffect, useEffectEvent } from 'react';
import { useMap } from './useMap';

export const useMapClick = (
  onClick: (coordinate: Coordinate) => void,
  enabled: boolean,
): void => {
  const map = useMap();
  const handleClick = useEffectEvent((coordinate: Coordinate) => {
    onClick(coordinate);
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const key = map.on('singleclick', (event) => {
      handleClick(event.coordinate);
    });
    return () => {
      unByKey(key);
    };
  }, [map, enabled]);
};
