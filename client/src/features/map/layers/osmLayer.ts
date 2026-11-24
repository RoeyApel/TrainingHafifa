import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

/** OpenStreetMap base layer, with OSM's required attribution. */
export function createOsmLayer(): TileLayer<OSM> {
  return new TileLayer({ source: new OSM() });
}
