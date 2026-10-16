import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router/dom";
import { router } from "@/app/router";
import { TripProvider } from "@/app/trip-state";
import { BookingRequestsProvider } from "@/features/booking/requests";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TripProvider>
        <BookingRequestsProvider>
          <RouterProvider router={router} />
        </BookingRequestsProvider>
      </TripProvider>
    </QueryClientProvider>
  );
}
