// 공식: docs/formulas/time-fit.md · 용어: docs/GLOSSARY.md
import { ACT_KEYS, COURSE_PREP_MIN } from "./constants";

/** 코스에 담긴 방문지 1곳. move = 숙소→장소 이동(분), dur = 체류(분) */
export interface CourseStop {
  move: number;
  dur: number;
}

/** 코스 가용 시간 = 외출 가능 시간 − COURSE_PREP_MIN (0 미만이면 0) */
export function courseAvailableMin(outingMin: number): number {
  return Math.max(0, outingMin - COURSE_PREP_MIN);
}

/**
 * [레거시 별 모양 — 비교용] 코스 사용 시간(분, 준비 시간 제외).
 * 공항→숙소 + Σ(숙소→장소 + 체류) + 복귀 구간
 * 복귀 구간 = 장소가 있으면 마지막 장소의 move, 없으면 공항→숙소 move(숙소도 없으면 0)
 */
export function courseUsedMin(roomMove: number | null, stops: readonly CourseStop[]): number {
  let used = 0;
  if (roomMove != null) used += roomMove;
  for (const s of stops) used += s.move + s.dur;
  const last = stops[stops.length - 1];
  used += last ? last.move : (roomMove ?? 0);
  return used;
}

export interface ScheduleSummary {
  /** 사용 시간 = 이동 + 체류 + 준비(COURSE_PREP_MIN) */
  usedMin: number;
  /** 가용 = 외출 가능 시간 */
  availableMin: number;
  /** 가용 − 사용 (음수면 초과). 코스 가용 시간 − 코스 사용 시간과 같다 */
  remainMin: number;
}

/**
 * 일정 요약 "사용 X / 가용 Y" (2026-10-16 결정 (b)).
 * courseUsed = 코스 사용 시간(준비 제외) — 순차 경로 `sequentialCourse().usedMin` 또는 레거시 `courseUsedMin()`
 */
export function scheduleSummary(outingMin: number, courseUsed: number): ScheduleSummary {
  const usedMin = courseUsed + COURSE_PREP_MIN;
  return { usedMin, availableMin: outingMin, remainMin: outingMin - usedMin };
}

/** availableMin = 코스 가용 시간 */
export function fitsBudget(availableMin: number, roomMove: number | null, stops: readonly CourseStop[]): boolean {
  return courseUsedMin(roomMove, stops) <= availableMin;
}

/** "환승 내 가능" 배지: 담겨 있으면 현재 일정, 아니면 이 장소를 더한 일정이 코스 가용 시간 안인가 */
export function wouldFit<T extends CourseStop & { id: string }>(
  availableMin: number,
  roomMove: number | null,
  plan: readonly T[],
  candidate: T,
): boolean {
  const inPlan = plan.some((p) => p.id === candidate.id);
  return fitsBudget(availableMin, roomMove, inPlan ? plan : [...plan, candidate]);
}

export interface CourseTimeline {
  /** 공항 밖으로 나가는 시각(Time-Safe exitAt) — 이후 준비 시간이 붙는다 */
  startAt: number;
  checkInAt: number | null;
  stops: { arriveAt: number; leaveAt: number }[];
  returnAt: number;
  /** 코스 사용 시간(준비 제외) = courseUsedMin */
  usedMin: number;
}

/** [레거시 별 모양 — 비교용] 일정 타임라인(분, 도착일 0시 기준) */
export function buildCourseTimeline(startMin: number, roomMove: number | null, stops: readonly CourseStop[]): CourseTimeline {
  let clock = startMin + COURSE_PREP_MIN;
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
  return {
    startAt: startMin,
    checkInAt,
    stops: stopTimes,
    returnAt: clock,
    usedMin: clock - startMin - COURSE_PREP_MIN,
  };
}

export interface AutoBuildPlace extends CourseStop {
  id: string;
  cat: string;
}

/**
 * [레거시 별 모양 — 비교용] 레거시 autoBuild — 탐욕법.
 * 1) 선택 카테고리(없으면 ACT_KEYS)를 온보딩 관심사 순서로 정렬(관심사에 없으면 뒤로)
 * 2) 카테고리마다 move+dur 오름차순으로 보며, 지금까지 고른 일정에 더해도 코스 가용 시간 안인 첫 장소 1곳을 담는다
 */
export function autoBuild<P extends AutoBuildPlace>(opts: {
  selected: readonly string[];
  interests: readonly string[];
  places: readonly P[];
  roomMove: number | null;
  availableMin: number;
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
      .find((p) => fitsBudget(opts.availableMin, opts.roomMove, [...chosen, p]));
    if (best) chosen.push(best);
  }
  return chosen;
}

/* ================= 순차 경로 (A6, 2026-10-16 결정) ================= */

/**
 * 순차 경로 코스. legs = [공항→호텔, 호텔→장소1, …, 장소N→공항] (장소 없으면 [공항→호텔, 호텔→공항]).
 * stays = 장소별 체류(분), legs.length === stays.length + 2 여야 한다.
 */
export interface SequentialCourse {
  /** 코스 사용 시간(준비 제외) = Σlegs + Σstays */
  usedMin: number;
  travelMin: number;
  stayMin: number;
  checkInAt: number;
  stops: { arriveAt: number; leaveAt: number }[];
  /** 마지막 장소(없으면 호텔)에서 공항으로 출발하는 시각 */
  lastDepartAt: number;
  /** 복귀 도착 예상 */
  returnAt: number;
  /** 복귀 구간(마지막 → 공항) 분 */
  returnLegMin: number;
}

export function sequentialCourse(startMin: number, legs: readonly number[], stays: readonly number[]): SequentialCourse {
  if (legs.length !== stays.length + 2) throw new Error(`legs(${legs.length}) must be stays(${stays.length}) + 2`);
  let clock = startMin + COURSE_PREP_MIN + legs[0]!;
  const checkInAt = clock;
  const stops = stays.map((stay, i) => {
    clock += legs[i + 1]!;
    const arriveAt = clock;
    clock += stay;
    return { arriveAt, leaveAt: clock };
  });
  const lastDepartAt = clock;
  const returnLegMin = legs[legs.length - 1]!;
  const travelMin = legs.reduce((a, b) => a + b, 0);
  const stayMin = stays.reduce((a, b) => a + b, 0);
  return { usedMin: travelMin + stayMin, travelMin, stayMin, checkInAt, stops, lastDepartAt, returnAt: lastDepartAt + returnLegMin, returnLegMin };
}

export interface ReturnPlan {
  /** 복귀 도착 목표 = Time-Safe returnBy */
  targetMin: number;
  /** 마지막 장소(없으면 호텔) 출발 기한 = 목표 − 복귀 구간 */
  lastDepartureDeadlineMin: number;
  /** 복귀 도착 예상이 목표보다 늦은가 */
  late: boolean;
  /** 늦은 분(늦지 않으면 0) */
  lateMin: number;
}

export function returnPlan(returnByMin: number, course: Pick<SequentialCourse, "returnAt" | "returnLegMin">): ReturnPlan {
  const lateMin = Math.max(0, course.returnAt - returnByMin);
  return { targetMin: returnByMin, lastDepartureDeadlineMin: returnByMin - course.returnLegMin, late: lateMin > 0, lateMin };
}

/** 장소 목록 → 순차 구간 분 수(공항→호텔 … →공항). 구간 시간은 호출부가 캐시·근사로 공급한다 */
export type LegsFor<P> = (stops: readonly P[]) => number[];

/** 순차 경로 코스 사용 시간(준비 제외) */
export function sequentialUsedMin<P extends { dur: number }>(legsFor: LegsFor<P>, stops: readonly P[]): number {
  return legsFor(stops).reduce((a, b) => a + b, 0) + stops.reduce((a, p) => a + p.dur, 0);
}

/** "환승 내 가능" — 담겨 있으면 현재 일정, 아니면 끝에 붙인 일정이 코스 가용 시간 안인가 */
export function wouldFitSequential<P extends { id: string; dur: number }>(
  availableMin: number,
  legsFor: LegsFor<P>,
  plan: readonly P[],
  candidate: P,
): boolean {
  const inPlan = plan.some((p) => p.id === candidate.id);
  return sequentialUsedMin(legsFor, inPlan ? plan : [...plan, candidate]) <= availableMin;
}

/**
 * 순차 경로 자동 추천 — 카테고리 순서·정렬은 레거시 autoBuild와 같다
 * (정렬 키 rankMove = 숙소→장소 분 + 체류). 판정만 순차 경로 used ≤ available.
 */
export function autoBuildSequential<P extends { id: string; cat: string; dur: number; rankMove: number }>(opts: {
  selected: readonly string[];
  interests: readonly string[];
  places: readonly P[];
  legsFor: LegsFor<P>;
  availableMin: number;
}): P[] {
  const pool = opts.selected.length ? [...opts.selected] : [...ACT_KEYS];
  const rank = (k: string) => {
    const i = opts.interests.indexOf(k);
    return i === -1 ? Infinity : i;
  };
  const chosen: P[] = [];
  for (const cat of pool.sort((a, b) => rank(a) - rank(b))) {
    const best = opts.places
      .filter((p) => p.cat === cat && !chosen.some((c) => c.id === p.id))
      .sort((a, b) => a.rankMove + a.dur - (b.rankMove + b.dur))
      .find((p) => sequentialUsedMin(opts.legsFor, [...chosen, p]) <= opts.availableMin);
    if (best) chosen.push(best);
  }
  return chosen;
}
