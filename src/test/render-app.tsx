import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { routes } from "@/app/router";
import { AppModeContext } from "@/app/app-mode";
import { TripProvider, type SavedCourse } from "@/app/trip-state";
import { BookingRequestsProvider, type BookingRequest } from "@/features/booking/requests";
import { MapViewContext } from "@/features/course/map-view";
import { FakeMapView } from "./fake-map";

/** 실제 라우트 표로 앱을 렌더한다(테스트마다 새 QueryClient — 캐시 공유 없음) */
export function renderApp(
  path: string,
  {
    onboarded = false,
    arrivalFlightId,
    departureFlightId,
    courseRoomId,
    savedCourse,
    demo = true,
    bookingRequests,
  }: {
    onboarded?: boolean;
    arrivalFlightId?: string;
    departureFlightId?: string;
    courseRoomId?: string;
    savedCourse?: SavedCourse;
    /** 데모 모드(기본 true). false = 운영 빌드처럼 */
    demo?: boolean;
    bookingRequests?: BookingRequest[];
  } = {},
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <AppModeContext.Provider value={{ demo }}>
        <TripProvider initial={{ onboarded, arrivalFlightId, departureFlightId, courseRoomId, savedCourse }}>
          <BookingRequestsProvider initial={bookingRequests}>
            {/* 테스트는 카카오맵 대신 모의 지도 */}
            <MapViewContext.Provider value={FakeMapView}>
              <RouterProvider router={router} />
            </MapViewContext.Provider>
          </BookingRequestsProvider>
        </TripProvider>
      </AppModeContext.Provider>
    </QueryClientProvider>,
  );
  return { ...utils, router };
}
