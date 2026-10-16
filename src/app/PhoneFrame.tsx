import { Outlet } from "react-router";

// 레거시와 같은 390px 모바일 프레임. 데스크톱에서는 가운데 정렬, 모바일에서는 전체 폭.
export function PhoneFrame() {
  return (
    <div className="flex min-h-dvh justify-center bg-backdrop sm:py-5">
      <div className="relative w-full max-w-(--ts-app-width) overflow-hidden bg-background sm:h-[800px] sm:rounded-[34px] sm:border-6 sm:border-[#101826]">
        <Outlet />
      </div>
    </div>
  );
}
