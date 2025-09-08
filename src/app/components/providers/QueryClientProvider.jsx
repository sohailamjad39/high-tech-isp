// app/components/providers/QueryClientProvider.jsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false, // Disable automatic refetch on window focus
      refetchOnReconnect: true,
      retry: 1,
      // Enable background refetching when data becomes stale
      refetchInterval: 300000, // Refetch every 5 minutes when window is focused
      refetchIntervalInBackground: false,
    }
  }
});

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}