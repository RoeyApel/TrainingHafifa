import type { Polygon } from 'ol/geom';
import type { FC } from 'react';
import { toFootprintPath } from '../../utils/footprintPath';

const BOX_PX = 44;
const PADDING_PX = 6;
/** The same blue as the forces layer's style on the map (GeoServer SLD). */
const FILL_COLOR = '#1565C0';
const FILL_OPACITY = 0.35;
const STROKE_COLOR = '#0D47A1';
const STROKE_WIDTH_PX = 1.5;

interface ForceFootprintProps {
  polygon: Polygon;
}

export const ForceFootprint: FC<ForceFootprintProps> = ({ polygon }) => {
  const [outerRing] = polygon.getCoordinates();

  return (
    <svg
      width={BOX_PX}
      height={BOX_PX}
      viewBox={`0 0 ${String(BOX_PX)} ${String(BOX_PX)}`}
      aria-hidden="true"
      focusable="false"
    >
      <path
        transform={`translate(${String(PADDING_PX)} ${String(PADDING_PX)})`}
        d={toFootprintPath(outerRing, BOX_PX - PADDING_PX * 2)}
        fill={FILL_COLOR}
        fillOpacity={FILL_OPACITY}
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH_PX}
        strokeLinejoin="round"
      />
    </svg>
  );
};
