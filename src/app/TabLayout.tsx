import { Navigate, Outlet, useLocation } from "react-router";
import { TabBar } from "@/app/TabBar";
import { useTrip } from "@/app/trip-state";

/** 탭바가 있는 화면들의 레이아웃. 스크롤 영역은 탭바 높이만큼 비운다. 온보딩 전이면 온보딩으로 보낸다(레거시도 항상 온보딩부터). */
export function TabLayout() {
  const { onboarded } = useTrip();
  const { pathname } = useLocation();
  if (!onboarded && !pathname.startsWith("/dev/")) return <Navigate to="/onboarding" replace />;
  return (
    <>
      <main className="absolute inset-x-0 top-0 bottom-(--ts-nav-height) overflow-y-auto">
        <Outlet />
      </main>
      <TabBar />
    </>
  );
}
