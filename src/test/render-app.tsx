import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { routes } from "@/app/router";
import { TripProvider } from "@/app/trip-state";

/** 실제 라우트 표로 앱을 렌더한다(테스트마다 새 QueryClient — 캐시 공유 없음) */
export function renderApp(path: string, { onboarded = false }: { onboarded?: boolean } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <TripProvider initial={{ onboarded }}>
        <RouterProvider router={router} />
      </TripProvider>
    </QueryClientProvider>,
  );
  return { ...utils, router };
}
