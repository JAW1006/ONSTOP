// 지도 어댑터: 화면은 MapScene(그릴 것)만 만들고, 실제 그리기는 MapView 구현이 한다.
// 실제 = KakaoMapView(카카오 JS SDK), 테스트 = 모의 구현(MapViewContext로 교체).
import { createContext, useContext, type ComponentType } from "react";
import type { TravelMode, LatLng } from "@/domain/travel";

export interface MapPin {
  id: string;
  kind: "airport" | "hotel" | "hotel-other" | "place";
  coord: LatLng;
  label: string;
  /** 장소 핀 번호(방문 순서) */
  number?: number;
}

export interface MapDot {
  id: string;
  /** candidate = 담을 수 있는 후보, ref = 참고용(병원·약국) */
  kind: "candidate" | "ref";
  coord: LatLng;
  name: string;
}

export interface MapLeg {
  index: number;
  from: LatLng;
  to: LatLng;
  path: LatLng[] | null;
  mode: TravelMode;
  isReturn: boolean;
  /** 칩: 아이콘 + 큰 글자(시간) + 작은 글자(거리, 실제 값일 때만) */
  chip: { icon: string; text: string; sub: string | null; ariaLabel: string };
}

export interface MapScene {
  center: LatLng;
  pins: MapPin[];
  dots: MapDot[];
  legs: MapLeg[];
  selectedLeg: number | null;
}

export interface MapViewProps {
  scene: MapScene;
  onPinClick: (id: string) => void;
  onDotClick: (id: string) => void;
  onLegClick: (index: number) => void;
  /** 지도를 못 띄울 때 보여줄 문구 */
  unavailableText: string;
}

export const MapViewContext = createContext<ComponentType<MapViewProps> | null>(null);

export function useMapView(fallback: ComponentType<MapViewProps>): ComponentType<MapViewProps> {
  return useContext(MapViewContext) ?? fallback;
}
