import {
  type UseMutationResult,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  ForceSaveResult,
  SaveForceRequest,
} from '../../types/forces/types';
import api from '../api';
import { invalidateForceQueries } from './invalidateForceQueries';

const saveForce = ({
  force,
  attributes,
  geometry,
}: SaveForceRequest): Promise<ForceSaveResult> => {
  return force
    ? api.forces().updateForce(force.id, attributes, geometry)
    : api.forces().createForce(attributes, geometry);
};

export const useSaveForce = (): UseMutationResult<
  ForceSaveResult,
  Error,
  SaveForceRequest
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveForce,
    onSuccess: () => invalidateForceQueries(queryClient),
  });
};
