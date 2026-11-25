import type OlMap from 'ol/Map';
import { createContext } from 'react';

export const MapContext = createContext<OlMap | null>(null);
