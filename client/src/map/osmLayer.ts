import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

export const createOsmLayer = (): TileLayer<OSM> => {
  return new TileLayer({ source: new OSM() });
};
