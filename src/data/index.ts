// 숙소·장소 데이터 — 레거시에서 추출(scripts/extract-legacy-data.mjs). 출처·검증 상태: docs/design/data.md
import type { CategoryKey } from "@/components/ui/badge";
import type { LatLng } from "@/domain/travel";
import type { LanguageCode } from "@/i18n/languages";
import raw from "./legacy-data.json";

export type Localized = Record<LanguageCode, string>;

export interface Room {
  id: string;
  name: Localized;
  /** 공항→숙소 대표 이동시간(분, 카카오모빌리티 실측) */
  distMin: number;
  hourMin: number;
  hourMax: number;
  /** hourMin 기준 기본가(원) — 미검증 추정치 */
  price: number;
  rate: number;
  cnt: number;
  tint: string;
  best?: boolean;
  /** 공항→숙소 이동시간(분) — 실측 전 폴백 */
  move: number;
  img: string | null;
  coord: LatLng;
}

export interface Place {
  id: string;
  cat: CategoryKey;
  name: Localized;
  area: Localized;
  /** 숙소→장소 이동시간 더미값(분) — 실측 전 폴백 */
  move: number;
  /** 체류(분) — 미검증 추정치 */
  dur: number;
  /** 원, 0이면 표시 안 함 — 미검증 추정치 */
  price: number;
  tint: string;
  coord: LatLng;
}

export const ROOMS = raw.rooms as Room[];
export const PLACES = raw.places as Place[];
export const AD_PLACE_IDS = new Set(raw.adPlaceIds);
/** 홈 "핫플레이스" — 제휴 AD 장소 중 실제로 다른 지점만(레거시 HOT_PLACE_IDS) */
export const HOT_PLACES = raw.hotPlaceIds.map((id) => PLACES.find((p) => p.id === id)!);

const hotelImages = import.meta.glob<string>("../assets/hotel/*", { eager: true, query: "?url", import: "default" });
/** 숙소 사진 URL(없으면 undefined → 틴트 배경) */
export const roomImage = (room: Room) => (room.img ? hotelImages[`../assets/hotel/${room.img}`] : undefined);

/** 데이터 이름 현지화 — 없는 언어는 ko(레거시 tr와 같음) */
export const localize = (value: Localized, lang: string) => value[lang as LanguageCode] ?? value.ko;
