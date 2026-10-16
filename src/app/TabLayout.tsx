import { Outlet } from "react-router";
import { TabBar } from "@/app/TabBar";

/** 탭바가 있는 화면들의 레이아웃. 스크롤 영역은 탭바 높이만큼 비운다. */
export function TabLayout() {
  return (
    <>
      <main className="absolute inset-x-0 top-0 bottom-(--ts-nav-height) overflow-y-auto">
        <Outlet />
      </main>
      <TabBar />
    </>
  );
}
