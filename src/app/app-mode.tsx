import { createContext, useContext } from "react";

/**
 * 데모 모드 — 예약 요청이 호텔에 전송되지 않는 환경(docs/design/screens/booking.md B6).
 * VITE_DEMO_MODE=true 또는 개발 서버. 운영 빌드에는 VITE_DEMO_MODE를 넣지 않는다(ADR-0005 "운영 배포 금지 조건").
 */
export const ENV_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true" || import.meta.env.DEV;

export interface AppMode {
  /** 데모 띠 표시 + 요청 버튼 동작 + 모든 숙소 노출 */
  demo: boolean;
}

export const AppModeContext = createContext<AppMode>({ demo: ENV_DEMO_MODE });

export const useAppMode = () => useContext(AppModeContext);
