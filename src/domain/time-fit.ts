// 공식: docs/formulas/time-fit.md
import { ACT_KEYS, PREP } from "./constants";

/** 코스에 담긴 방문지 1곳. move = 숙소→장소 이동(분), dur = 체류(분) */
export interface CourseStop {
  move: number;
  dur: number;
}

/**
 * 코스 사용 시간(분).
 * PREP + 공항→숙소 + Σ(숙소→장소 + 체류) + 복귀 구간
 * 복귀 구간 = 장소가 있으면 마지막 장소의 move, 없으면 공항→숙소 move(숙소도 없으면 0)
 */
export function courseUsedMin(roomMove: number | null, stops: readonly CourseStop[]): number {
  let used = PREP;
  if (roomMove != null) used += roomMove;
  for (const s of stops) used += s.move + s.dur;
  const last = stops[stops.length - 1];
  used += last ? last.move : (roomMove ?? 0);
  return used;
}

export function fitsBudget(budgetMin: number, roomMove: number | null, stops: readonly CourseStop[]): boolean {
  return courseUsedMin(roomMove, stops) <= budgetMin;
}

/** "환승 내 가능" 배지: 담겨 있으면 현재 일정, 아니면 이 장소를 더한 일정이 예산 안인가 */
export function wouldFit<T extends CourseStop & { id: string }>(
  budgetMin: number,
  roomMove: number | null,
  plan: readonly T[],
  candidate: T,
): boolean {
  const inPlan = plan.some((p) => p.id === candidate.id);
  return fitsBudget(budgetMin, roomMove, inPlan ? plan : [...plan, candidate]);
}

export interface CourseTimeline {
  arriveAt: number;
  checkInAt: number | null;
  stops: { arriveAt: number; leaveAt: number }[];
  returnAt: number;
  usedMin: number;
}

/** 일정 타임라인(분, 도착일 0시 기준) — 코스 빌더·저장된 코스 화면 공용 */
export function buildCourseTimeline(arriveMin: number, roomMove: number | null, stops: readonly CourseStop[]): CourseTimeline {
  let clock = arriveMin + PREP;
  let checkInAt: number | null = null;
  if (roomMove != null) {
    clock += roomMove;
    checkInAt = clock;
  }
  const stopTimes = stops.map((s) => {
    clock += s.move;
    const arriveAt = clock;
    clock += s.dur;
    return { arriveAt, leaveAt: clock };
  });
  const last = stops[stops.length - 1];
  clock += last ? last.move : (roomMove ?? 0);
  return { arriveAt: arriveMin, checkInAt, stops: stopTimes, returnAt: clock, usedMin: clock - arriveMin };
}

export interface AutoBuildPlace extends CourseStop {
  id: string;
  cat: string;
}

/**
 * 레거시 autoBuild — 탐욕법.
 * 1) 선택 카테고리(없으면 ACT_KEYS)를 온보딩 관심사 순서로 정렬(관심사에 없으면 뒤로)
 * 2) 카테고리마다 move+dur 오름차순으로 보며, 지금까지 고른 일정에 더해도 예산 안인 첫 장소 1곳을 담는다
 */
export function autoBuild<P extends AutoBuildPlace>(opts: {
  selected: readonly string[];
  interests: readonly string[];
  places: readonly P[];
  roomMove: number | null;
  budgetMin: number;
}): P[] {
  const pool = opts.selected.length ? [...opts.selected] : [...ACT_KEYS];
  const rank = (k: string) => {
    const i = opts.interests.indexOf(k);
    return i === -1 ? Infinity : i;
  };
  const catOrder = pool.sort((a, b) => rank(a) - rank(b));
  const chosen: P[] = [];
  for (const cat of catOrder) {
    const best = opts.places
      .filter((p) => p.cat === cat && !chosen.some((c) => c.id === p.id))
      .sort((a, b) => a.move + a.dur - (b.move + b.dur))
      .find((p) => fitsBudget(opts.budgetMin, opts.roomMove, [...chosen, p]));
    if (best) chosen.push(best);
  }
  return chosen;
}
