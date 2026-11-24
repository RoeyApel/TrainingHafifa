import OlMap from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import { type RefObject, useEffect, useState } from 'react';
import {
  INITIAL_CENTER_LON_LAT,
  INITIAL_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
} from '../config/map.config';
import { createOsmLayer } from '../layers/osmLayer';

function createMap(): OlMap {
  return new OlMap({
    layers: [createOsmLayer()],
    view: new View({
      center: fromLonLat(INITIAL_CENTER_LON_LAT),
      zoom: INITIAL_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
    }),
  });
}

/**
 * Creates one OpenLayers map for the component's lifetime and attaches it to
 * `targetRef`. Returns the map so feature layers can be added to it.
 *
 * The map lives in state rather than being built inside the effect, so
 * StrictMode's mount-unmount-mount detaches and re-attaches the same map
 * instead of building a second one. OpenLayers resizes the map itself when
 * the target element changes size.
 */
export function useOlMap(targetRef: RefObject<HTMLElement | null>): OlMap {
  const [map] = useState(createMap);

  useEffect(() => {
    map.setTarget(targetRef.current ?? undefined);
    return () => {
      map.setTarget(undefined);
    };
  }, [map, targetRef]);

  return map;
}
