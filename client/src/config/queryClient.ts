import { QueryClient } from '@tanstack/react-query';

export const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // A click is a one-off question about the map as it is now.
        retry: 1,
        refetchOnWindowFocus: false,
      },
      // Writes are not idempotent: never repeat them behind the user's back.
      mutations: { retry: false },
    },
  });
};
