// 이동시간·주변 장소 조회(server/ 프록시). 구간 출처 규칙: docs/design/screens/course-map.md "이동 시간·거리 데이터"
import type { CoursePlace } from "@/data";
import { haversineKm, pickTravelMode, routeSecToMin, transitMin, walkMin, type LatLng, type TravelMode } from "@/domain/travel";

export interface TravelResult {
  min: number;
  mode: TravelMode;
  /** true = 실제 경로 값이 아니라 어림값("약 N분") — 도보 추정, 조회 실패·조회 전 */
  approx: boolean;
  /** 실제 경로 좌표(없으면 직선) */
  path: LatLng[] | null;
  /** 실제 경로 거리(m) — 자동차·대중교통 응답에 있을 때만 */
  distanceM: number | null;
  /** 대중교통 환승 횟수(탄 횟수 합 − 1) — ODsay 응답에 있을 때만 */
  transfers: number | null;
  /** 대중교통 요금(원) */
  fare: number | null;
}

async function getJson(url: string) {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
  return data;
}

const q = (from: LatLng, to: LatLng) => `originLat=${from.lat}&originLng=${from.lng}&destLat=${to.lat}&destLng=${to.lng}`;

/**
 * 레거시 fetchTravelMin과 같은 분기: 직선 ≤ 1.2km 도보(추정, 조회 안 함), ≥ 6km 대중교통(ODsay) 실패 시 자동차,
 * 그 사이 자동차(카카오모빌리티). 자동차 구간은 화면에서 "택시"로 표시한다.
 */
export async function fetchTravel(from: LatLng, to: LatLng): Promise<TravelResult> {
  const km = haversineKm(from, to);
  const mode = pickTravelMode(km);
  if (mode === "walk") return { min: walkMin(km), mode, approx: true, path: null, distanceM: null, transfers: null, fare: null };
  if (mode === "transit") {
    try {
      const d = await getJson(`/api/transit?${q(from, to)}`);
      if (d.durationMin != null) {
        const rides = (d.busTransitCount ?? 0) + (d.subwayTransitCount ?? 0);
        const hasCounts = typeof d.busTransitCount === "number" || typeof d.subwayTransitCount === "number";
        return {
          min: transitMin(d.durationMin),
          mode: "transit",
          approx: false,
          path: d.path?.length > 1 ? d.path : null,
          distanceM: typeof d.distanceM === "number" ? d.distanceM : null,
          transfers: hasCounts ? Math.max(0, rides - 1) : null,
          fare: typeof d.fare === "number" ? d.fare : null,
        };
      }
    } catch {
      // ODsay 실패 → 자동차로 대체(레거시 동일)
    }
  }
  const d = await getJson(`/api/route?${q(from, to)}`);
  if (d.durationSec == null) throw new Error("no route");
  return {
    min: routeSecToMin(d.durationSec),
    mode: "drive",
    approx: false,
    path: d.path?.length > 1 ? d.path : null,
    distanceM: typeof d.distanceM === "number" ? d.distanceM : null,
    transfers: null,
    fare: null,
  };
}

/* ---------- 주변 실제 장소(카카오 로컬) — 레거시 Course 1661–1720줄 규칙 ---------- */

/** 지도에 얹는 업종(카카오 category_group_code) */
export const NEARBY_CATEGORIES = ["FD6", "CE7", "CS2", "MT1", "AT4", "HP8", "PM9"] as const;
/** 일정에 담을 수 있는 업종 → 코스 카테고리. 나머지(병원 HP8·약국 PM9)는 참고용 점 */
export const POI_ADDABLE_CAT: Record<string, CoursePlace["cat"]> = { FD6: "Food", CE7: "Food", CS2: "Shopping", MT1: "Shopping", AT4: "Sightseeing" };
/** 카테고리 코드가 없는 K-뷰티 리테일 — 이름으로 찾아 뷰티에 합친다 */
export const BEAUTY_BRAND_KEYWORDS = ["올리브영", "에뛰드", "이니스프리", "미샤", "네이처리퍼블릭", "더샘", "토니모리"];

interface RawPoi {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
}
export interface RefPoi {
  id: string;
  name: string;
  coord: LatLng;
}

const toLivePlace = (p: RawPoi, cat: CoursePlace["cat"]): CoursePlace => {
  const text = { ko: p.name, en: p.name, zh: p.name, ja: p.name, vi: p.name };
  const area = { ko: p.category, en: p.category, zh: p.category, ja: p.category, vi: p.category };
  return { id: `live-${p.id}`, cat, name: text, area, durMin: 0, price: 0, tint: "", coord: { lat: p.lat, lng: p.lng }, live: true };
};

/** 숙소 주변 실시간 장소: 담을 수 있는 장소 + 참고용 점. 카카오 place id 기준 중복 제거(레거시 동일) */
export async function fetchNearby(center: LatLng): Promise<{ addable: CoursePlace[]; ref: RefPoi[] }> {
  const safe = (p: Promise<RawPoi[]>) => p.catch(() => [] as RawPoi[]);
  const byCat = await Promise.all(
    NEARBY_CATEGORIES.map((c) =>
      safe(getJson(`/api/places?lat=${center.lat}&lng=${center.lng}&category=${c}&radius=1500`).then((d) => d.places ?? [])).then(
        (list) => list.map((p: RawPoi) => ({ ...p, catCode: c })),
      ),
    ),
  );
  const beauty = await Promise.all(
    BEAUTY_BRAND_KEYWORDS.map((kw) =>
      safe(getJson(`/api/places/search?lat=${center.lat}&lng=${center.lng}&query=${encodeURIComponent(kw)}&radius=3000`).then((d) => d.places ?? [])),
    ),
  );
  const seen = new Set<string>();
  const addable: CoursePlace[] = [];
  const ref: RefPoi[] = [];
  for (const p of byCat.flat()) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    const cat = POI_ADDABLE_CAT[p.catCode];
    if (cat) addable.push(toLivePlace(p, cat));
    else ref.push({ id: p.id, name: p.name, coord: { lat: p.lat, lng: p.lng } });
  }
  for (const p of beauty.flat()) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    addable.push(toLivePlace(p, "Beauty"));
  }
  return { addable, ref };
}
