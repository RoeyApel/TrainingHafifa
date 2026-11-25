import Overlay from 'ol/Overlay';
import type { Coordinate } from 'ol/coordinate';
import { type ReactNode, useEffect, useState, type FC } from 'react';
import { createPortal } from 'react-dom';
import { useMap } from '../../hooks/useMap';

const POPUP_OFFSET_PX: [number, number] = [0, -12];
const AUTO_PAN_MS = 250;

interface MapPopupProps {
  /** Map coordinate the popup points at; hidden when undefined. */
  position: Coordinate | undefined;
  children: ReactNode;
}

export const MapPopup: FC<MapPopupProps> = ({ position, children }) => {
  const map = useMap();
  const [element] = useState(() => document.createElement('div'));
  const [overlay] = useState(
    () =>
      new Overlay({
        positioning: 'bottom-center',
        offset: POPUP_OFFSET_PX,
        autoPan: { animation: { duration: AUTO_PAN_MS } },
      }),
  );

  useEffect(() => {
    // Attached here, not in the initializer: StrictMode runs initializers
    // twice, and the discarded Overlay would steal the element from the DOM.
    overlay.setElement(element);
    map.addOverlay(overlay);
    return () => {
      map.removeOverlay(overlay);
    };
  }, [map, overlay, element]);

  useEffect(() => {
    overlay.setPosition(position);
  }, [overlay, position]);

  return createPortal(children, element);
};
