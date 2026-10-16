import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router/dom";
import { router } from "@/app/router";
import { TripProvider } from "@/app/trip-state";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TripProvider>
        <RouterProvider router={router} />
      </TripProvider>
    </QueryClientProvider>
  );
}
