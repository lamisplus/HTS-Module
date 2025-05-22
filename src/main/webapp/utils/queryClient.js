import { QueryClient } from "react-query";

const queryClientSettings = {
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      cacheTime: 1000 * 60 * 10,
      staleTime: 1000 * 60 * 5,
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