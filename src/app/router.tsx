import { createBrowserRouter } from "react-router";
import { PhoneFrame } from "@/app/PhoneFrame";

// 1단계: 셸만 띄운다. 탭(홈/짐 케어/코스/예약/마이)과 화면 라우트는 3·4단계에서 추가.
export const router = createBrowserRouter([
  {
    path: "/",
    element: <PhoneFrame />,
    children: [
      {
        index: true,
        element: (
          <div className="p-4 text-sm text-sub">
            TimeStay React 셸 — 화면은 4단계에서 이식합니다.
          </div>
        ),
      },
    ],
  },
]);
