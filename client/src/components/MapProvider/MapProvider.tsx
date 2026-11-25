import { type ReactNode, useState, type FC } from 'react';
import { createMap } from '../../map/createMap';
import { MapContext } from '../../contexts/MapContext';

interface MapProviderProps {
  children: ReactNode;
}

/**
 * Owns the single map instance. It lives in state, so StrictMode's double
 * mount re-attaches the same map instead of building a second one.
 */
export const MapProvider: FC<MapProviderProps> = ({ children }) => {
  const [map] = useState(createMap);
  return <MapContext value={map}>{children}</MapContext>;
};
