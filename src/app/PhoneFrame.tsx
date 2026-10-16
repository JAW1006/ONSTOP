import { useState } from "react";
import { Outlet } from "react-router";
import { PortalContainerContext } from "@/components/ui/portal-container";

// 레거시와 같은 390×800 모바일 프레임. 데스크톱에서는 가운데 정렬, 모바일에서는 화면 전체.
// 바텀시트 같은 포털은 이 프레임 안에 붙는다.
export function PhoneFrame() {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div className="flex min-h-dvh justify-center bg-backdrop sm:py-5">
      <div
        ref={setFrame}
        className="relative h-dvh w-full max-w-(--ts-app-width) overflow-hidden bg-background sm:h-[800px] sm:rounded-(--ts-device-radius) sm:border-6 sm:border-(--ts-device-bezel) sm:shadow-(--ts-shadow-device)"
      >
        <PortalContainerContext.Provider value={frame}>
          <Outlet />
        </PortalContainerContext.Provider>
      </div>
    </div>
  );
}
