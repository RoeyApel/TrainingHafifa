import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { toForce } from '../../mappers/forceFeature';
import { FORCES_QUERY_KEY, type Force } from '../../types/forces/types';
import { FORCES_LAYER } from '../../types/geoserver/types';
import api from '../api';

const getForces = async (signal: AbortSignal): Promise<Force[]> => {
  const features = await api
    .geoserver()
    .getActiveFeatures(FORCES_LAYER, signal);
  return features
    .map(toForce)
    .sort((a, b) => a.unitName.localeCompare(b.unitName, 'he'));
};

/** Every active force, sorted by unit name. */
export const useForces = (): UseQueryResult<Force[]> => {
  return useQuery({
    queryKey: FORCES_QUERY_KEY,
    queryFn: ({ signal }) => getForces(signal),
  });
};
