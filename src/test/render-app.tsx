import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { routes } from "@/app/router";
import { TripProvider, type SavedCourse } from "@/app/trip-state";
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
  }: { onboarded?: boolean; arrivalFlightId?: string; departureFlightId?: string; courseRoomId?: string; savedCourse?: SavedCourse } = {},
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <TripProvider initial={{ onboarded, arrivalFlightId, departureFlightId, courseRoomId, savedCourse }}>
        {/* 테스트는 카카오맵 대신 모의 지도 */}
        <MapViewContext.Provider value={FakeMapView}>
          <RouterProvider router={router} />
        </MapViewContext.Provider>
      </TripProvider>
    </QueryClientProvider>,
  );
  return { ...utils, router };
}
