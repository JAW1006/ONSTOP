// 공식: docs/formulas/time-fit.md "이동시간"
import { LIVE_PLACE_MIN_PER_KM, TRANSIT_MIN_KM, WALK_MAX_KM, WALK_SPEED_KMH } from "./constants";

export interface LatLng {
  lat: number;
  lng: number;
}

export type TravelMode = "walk" | "transit" | "drive";

/** 두 좌표 사이 직선거리(km), 지구 반지름 6371km */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

/** 처음 시도할 이동수단. transit은 실패 시 호출부에서 drive로 폴백한다. */
export function pickTravelMode(km: number): TravelMode {
  if (km <= WALK_MAX_KM) return "walk";
  if (km >= TRANSIT_MIN_KM) return "transit";
  return "drive";
}

/** 도보 추정(분), 최소 1 */
export function walkMin(km: number): number {
  return Math.max(1, Math.round((km / WALK_SPEED_KMH) * 60));
}

/** 카카오모빌리티 durationSec → 분, 최소 1 */
export function routeSecToMin(sec: number): number {
  return Math.max(1, Math.round(sec / 60));
}

/** ODsay durationMin → 분, 최소 1 */
export function transitMin(min: number): number {
  return Math.max(1, Math.round(min));
}

/** 실측 전 실시간 장소의 임시 이동시간(분), 최소 1 */
export function liveEstimateMin(km: number): number {
  return Math.max(1, Math.round(km * LIVE_PLACE_MIN_PER_KM));
}

/**
 * 실측 전·실측 실패 시 구간 근사(A6, "약 N분" 표기용).
 * 도보 거리(≤ WALK_MAX_KM)는 도보 추정, 그 외는 직선거리 × LIVE_PLACE_MIN_PER_KM. 수단은 pickTravelMode 기준.
 */
export function approxTravel(km: number): { min: number; mode: TravelMode; approx: true } {
  const mode = pickTravelMode(km);
  return { min: mode === "walk" ? walkMin(km) : liveEstimateMin(km), mode, approx: true };
}
