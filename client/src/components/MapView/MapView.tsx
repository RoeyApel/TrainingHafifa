import 'ol/ol.css';
import './MapView.css';
import Box from '@mui/material/Box';
import { useEffect, useRef, type FC } from 'react';
import { useMap } from '../../hooks/useMap';

/** OpenLayers watches the element's size itself: no resize handling needed. */
export const MapView: FC = () => {
  const map = useMap();
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    map.setTarget(targetRef.current ?? undefined);
    return () => {
      map.setTarget(undefined);
    };
  }, [map]);

  return (
    <Box
      ref={targetRef}
      role="region"
      aria-label="מפה"
      sx={{ width: 1, height: 1 }}
    />
  );
};
