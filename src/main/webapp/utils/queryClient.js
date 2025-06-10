import { QueryClient } from "react-query";

const queryClientSettings = {
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      cacheTime: 1000,
      staleTime: 1000,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      suspense: false
    },
    mutations: {
      retry: 1
    }
  }
};

export const queryClient = new QueryClient(queryClientSettings);