import { createContext, useContext } from "react";

/** 바텀시트 등 포털이 붙을 요소(폰 프레임). 없으면 document.body */
export const PortalContainerContext = createContext<HTMLElement | null>(null);

export function usePortalContainer() {
  return useContext(PortalContainerContext);
}
