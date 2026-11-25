import type { QueryClient } from '@tanstack/react-query';
import { FORCES_QUERY_KEY } from '../../types/forces/types';
import { IDENTIFY_QUERY_KEY } from '../../types/identify/types';

/** Everything that shows forces must be refetched after one changes. */
export const invalidateForceQueries = async (
  queryClient: QueryClient,
): Promise<void> => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: IDENTIFY_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: FORCES_QUERY_KEY }),
  ]);
};
