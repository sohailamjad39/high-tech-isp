// app/lib/queryClient.js
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 24 * 60 * 60 * 1000, //24 hrs
      cacheTime: 42 * 60 * 60 * 1000, //42 hrs
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1
    }
  }
});