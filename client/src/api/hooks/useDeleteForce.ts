import {
  type UseMutationResult,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { Force } from '../../types/forces/types';
import api from '../api';
import { invalidateForceQueries } from './invalidateForceQueries';

export const useDeleteForce = (): UseMutationResult<void, Error, Force> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (force: Force) => api.forces().deleteForce(force.id),
    onSuccess: () => invalidateForceQueries(queryClient),
  });
};
