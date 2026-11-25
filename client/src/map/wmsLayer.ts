import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import { GEOSERVER_BASE_PATH } from '../config/endpoints';
import {
  ACTIVE_FEATURES_FILTER,
  GEOSERVER_WORKSPACE,
  type GeoServerLayer,
} from '../types/geoserver/types';

const WMS_URL = `${GEOSERVER_BASE_PATH}/${GEOSERVER_WORKSPACE}/wms`;
/** Extra WMS parameter that changes on refresh, so no cached image is reused. */
const REVISION_PARAM = 'REVISION';

/**
 * The layer as GeoServer renders it, with the layer's own SLD style.
 * One image per view (not tiles) so labels are never cut at tile edges.
 */
export const createWmsLayer = (
  layer: GeoServerLayer,
  zIndex: number,
): ImageLayer<ImageWMS> => {
  return new ImageLayer({
    zIndex,
    source: new ImageWMS({
      url: WMS_URL,
      serverType: 'geoserver',
      ratio: 1,
      params: {
        LAYERS: layer.typeName,
        CQL_FILTER: ACTIVE_FEATURES_FILTER,
        [REVISION_PARAM]: 0,
      },
    }),
  });
};

export const refreshWmsLayer = (layer: ImageLayer<ImageWMS>): void => {
  layer.getSource()?.updateParams({ [REVISION_PARAM]: Date.now() });
};
