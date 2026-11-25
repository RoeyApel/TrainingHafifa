import { skipToken, useQuery } from '@tanstack/react-query';
import type { Coordinate } from 'ol/coordinate';
import { useCallback, useState } from 'react';
import {
  IDENTIFY_QUERY_KEY,
  type Identify,
  type IdentifiedFeature,
} from '../../types/identify/types';
import { transform } from 'ol/proj';
import { toForce } from '../../mappers/forceFeature';
import { toTrainingArea } from '../../mappers/trainingAreaFeature';
import { DATA_PROJECTION, MAP_PROJECTION } from '../../map/projections';
import {
  FORCES_LAYER,
  TRAINING_AREAS_LAYER,
} from '../../types/geoserver/types';
import { findSmallestFeature } from '../../utils/findSmallestFeature';
import api from '../api';
import { IdentifiedFeatureType } from '../../types/identify/enums';

const identifyAt = async (
  coordinate: Coordinate,
  signal: AbortSignal,
): Promise<IdentifiedFeature | null> => {
  const point = transform(coordinate, MAP_PROJECTION, DATA_PROJECTION);

  const [areaFeatures, forceFeatures] = await Promise.all([
    api.geoserver().getFeaturesAtPoint(TRAINING_AREAS_LAYER, point, signal),
    api.geoserver().getFeaturesAtPoint(FORCES_LAYER, point, signal),
  ]);
  const smallest = findSmallestFeature([...forceFeatures, ...areaFeatures]);
  if (!smallest) {
    return null;
  }
  return forceFeatures.includes(smallest)
    ? { type: IdentifiedFeatureType.Force, force: toForce(smallest) }
    : {
        type: IdentifiedFeatureType.TrainingArea,
        area: toTrainingArea(smallest),
      };
};

/**
 * What's under the last click. A new click supersedes the previous one:
 * TanStack Query aborts the stale request and ignores its answer.
 */
export const useIdentify = (): Identify => {
  const [coordinate, setCoordinate] = useState<Coordinate | null>(null);
  const query = useQuery({
    queryKey: [...IDENTIFY_QUERY_KEY, coordinate],
    queryFn: coordinate
      ? ({ signal }) => identifyAt(coordinate, signal)
      : skipToken,
  });
  const close = useCallback(() => {
    setCoordinate(null);
  }, []);

  return {
    coordinate,
    result: query.data,
    isLoading: coordinate !== null && query.isPending,
    isError: query.isError,
    identify: setCoordinate,
    close,
  };
};
