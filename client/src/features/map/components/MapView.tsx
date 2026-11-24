import 'ol/ol.css';
import Box from '@mui/material/Box';
import { type ReactElement, useRef } from 'react';
import { useOlMap } from '../hooks/useOlMap';

/** Fills its parent with the OpenLayers map. */
export function MapView(): ReactElement {
  const targetRef = useRef<HTMLDivElement>(null);
  useOlMap(targetRef);

  return (
    <Box
      ref={targetRef}
      role="region"
      aria-label="מפה"
      sx={{ width: 1, height: 1 }}
    />
  );
}
