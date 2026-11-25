import Feature from 'ol/Feature';
import { Polygon } from 'ol/geom';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';
import { useEffect, useEffectEvent, useState } from 'react';
import { useMap } from '../../hooks/useMap';
import { SketchMode } from '../../types/forces/enums';

/** Above the GeoServer layers, so the shape being edited is never hidden. */
const SKETCH_Z_INDEX = 100;

const SKETCH_STYLE = new Style({
  fill: new Fill({ color: 'rgba(25, 118, 210, 0.2)' }),
  stroke: new Stroke({ color: '#1976d2', width: 2, lineDash: [8, 6] }),
});

const createDrawInteraction = (onDrawn: (polygon: Polygon) => void): Draw => {
  const draw = new Draw({ type: 'Polygon', style: SKETCH_STYLE });
  draw.on('drawend', ({ feature }) => {
    const geometry = feature.getGeometry();
    if (geometry instanceof Polygon) {
      onDrawn(geometry);
    }
  });
  return draw;
};

interface ForceSketchLayerProps {
  mode: SketchMode;
  /** The shape to show (and modify in place); null while drawing. */
  polygon: Polygon | null;
  onDrawn: (polygon: Polygon) => void;
}

/**
 * The polygon being added or edited, with the OpenLayers interaction for
 * the current step. Modify edits `polygon` in place, so the parent always
 * reads the latest shape from the object it passed in.
 */
export const ForceSketchLayer = ({
  mode,
  polygon,
  onDrawn,
}: ForceSketchLayerProps): null => {
  const map = useMap();
  const [source] = useState(() => new VectorSource<Feature<Polygon>>());
  const [layer] = useState(
    () =>
      new VectorLayer({ source, style: SKETCH_STYLE, zIndex: SKETCH_Z_INDEX }),
  );
  const handleDrawn = useEffectEvent(onDrawn);

  useEffect(() => {
    map.addLayer(layer);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, layer]);

  useEffect(() => {
    source.clear();
    if (polygon) {
      source.addFeature(new Feature(polygon));
    }
  }, [source, polygon]);

  useEffect(() => {
    if (mode === SketchMode.View) {
      return;
    }
    const interaction =
      mode === SketchMode.Draw
        ? createDrawInteraction((drawn) => {
            handleDrawn(drawn);
          })
        : new Modify({ source });
    map.addInteraction(interaction);
    return () => {
      map.removeInteraction(interaction);
    };
  }, [map, source, mode]);

  return null;
};
