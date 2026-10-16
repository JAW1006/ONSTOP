// 순차 경로 구간(A6). 코스 빌더는 보수적 근사만 쓰고, 실제 경로는 코스 확정(저장) 후에만 조회한다(2026-10-16 결정).
import { useQueries } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { AIRPORT_COORD } from "@/data";
import { approxTravel, haversineKm, type LatLng } from "@/domain/travel";
import { fetchTravel, type TravelResult } from "./api";

const round = (n: number) => Math.round(n * 1e5) / 1e5;
export const travelKey = (from: LatLng, to: LatLng) => ["travel", round(from.lat), round(from.lng), round(to.lat), round(to.lng)] as const;

export function approxResult(from: LatLng, to: LatLng): TravelResult {
  const a = approxTravel(haversineKm(from, to));
  return { min: a.min, mode: a.mode, approx: true, path: null, distanceM: null, transfers: null, fare: null };
}

export interface RouteLeg extends TravelResult {
  from: LatLng;
  to: LatLng;
  /** 공항 복귀 구간 */
  isReturn: boolean;
  /** 아직 조회 중 */
  loading: boolean;
}

/** 공항 → 호텔 → 장소들 → 공항. 호텔이 없으면 빈 배열 */
export function routePoints(hotel: LatLng | null, stops: readonly { coord: LatLng }[]): LatLng[] {
  return hotel ? [AIRPORT_COORD, hotel, ...stops.map((s) => s.coord), AIRPORT_COORD] : [];
}

/**
 * 경로의 각 구간. live = true(확정된 코스)면 실제 경로를 조회해 캐시, 결과 전까지·실패 시 근사값.
 * live = false(코스 빌더)면 조회하지 않고 보수적 근사만.
 */
export function useRouteLegs(points: readonly LatLng[], { live }: { live: boolean }): { legs: RouteLeg[]; loading: boolean } {
  const pairs = useMemo(() => points.slice(0, -1).map((from, i) => ({ from, to: points[i + 1]! })), [points]);
  const results = useQueries({
    queries: (live ? pairs : []).map(({ from, to }) => ({
      queryKey: travelKey(from, to),
      queryFn: () => fetchTravel(from, to),
      staleTime: Infinity,
      gcTime: Infinity,
      retry: false,
    })),
  });
  const legs = pairs.map(({ from, to }, i) => {
    const r = results[i];
    const base = r?.data ?? approxResult(from, to);
    return { ...base, from, to, isReturn: i === pairs.length - 1 && pairs.length > 1, loading: !!r?.isPending };
  });
  return { legs, loading: results.some((r) => r.isPending) };
}

/** 장소 목록 → 순차 구간 분 수(보수적 근사만). 자동 추천·"환승 내 가능" 판정용 domain LegsFor */
export function useApproxLegsFor(hotel: LatLng | null) {
  return useCallback(
    (stops: readonly { coord: LatLng }[]) => {
      const pts = routePoints(hotel, stops);
      return pts.slice(0, -1).map((from, i) => approxResult(from, pts[i + 1]!).min);
    },
    [hotel],
  );
}
