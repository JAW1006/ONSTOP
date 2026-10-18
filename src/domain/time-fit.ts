// 공식: docs/formulas/time-fit.md · 용어: docs/GLOSSARY.md
import { ACT_KEYS, COURSE_PREP_MIN } from "./constants";

/** 코스에 담긴 방문지 1곳. moveMin = 숙소→장소 이동(분), durMin = 체류(분) */
export interface CourseStop {
  moveMin: number;
  durMin: number;
}

/** 코스 가용 시간 = 외출 가능 시간 − COURSE_PREP_MIN (0 미만이면 0) */
export function courseAvailableMin(outingMin: number): number {
  return Math.max(0, outingMin - COURSE_PREP_MIN);
}

/**
 * [레거시 별 모양 — 비교용] 코스 사용 시간(분, 준비 시간 제외).
 * 공항→숙소 + Σ(숙소→장소 + 체류) + 복귀 구간
 * 복귀 구간 = 장소가 있으면 마지막 장소의 moveMin, 없으면 공항→숙소 moveMin(숙소도 없으면 0)
 */
export function courseUsedMin(roomMoveMin: number | null, stops: readonly CourseStop[]): number {
  let used = 0;
  if (roomMoveMin != null) used += roomMoveMin;
  for (const s of stops) used += s.moveMin + s.durMin;
  const last = stops[stops.length - 1];
  used += last ? last.moveMin : (roomMoveMin ?? 0);
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
export function fitsBudget(availableMin: number, roomMoveMin: number | null, stops: readonly CourseStop[]): boolean {
  return courseUsedMin(roomMoveMin, stops) <= availableMin;
}

/** "환승 내 가능" 배지: 담겨 있으면 현재 일정, 아니면 이 장소를 더한 일정이 코스 가용 시간 안인가 */
export function wouldFit<T extends CourseStop & { id: string }>(
  availableMin: number,
  roomMoveMin: number | null,
  plan: readonly T[],
  candidate: T,
): boolean {
  const inPlan = plan.some((p) => p.id === candidate.id);
  return fitsBudget(availableMin, roomMoveMin, inPlan ? plan : [...plan, candidate]);
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
export function buildCourseTimeline(startMin: number, roomMoveMin: number | null, stops: readonly CourseStop[]): CourseTimeline {
  let clock = startMin + COURSE_PREP_MIN;
  let checkInAt: number | null = null;
  if (roomMoveMin != null) {
    clock += roomMoveMin;
    checkInAt = clock;
  }
  const stopTimes = stops.map((s) => {
    clock += s.moveMin;
    const arriveAt = clock;
    clock += s.durMin;
    return { arriveAt, leaveAt: clock };
  });
  const last = stops[stops.length - 1];
  clock += last ? last.moveMin : (roomMoveMin ?? 0);
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
 * 2) 카테고리마다 moveMin+durMin 오름차순으로 보며, 지금까지 고른 일정에 더해도 코스 가용 시간 안인 첫 장소 1곳을 담는다
 */
export function autoBuild<P extends AutoBuildPlace>(opts: {
  selected: readonly string[];
  interests: readonly string[];
  places: readonly P[];
  roomMoveMin: number | null;
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
      .sort((a, b) => a.moveMin + a.durMin - (b.moveMin + b.durMin))
      .find((p) => fitsBudget(opts.availableMin, opts.roomMoveMin, [...chosen, p]));
    if (best) chosen.push(best);
  }
  return chosen;
}

/* ================= 순차 경로 (A6, 2026-10-16 결정 · B1 호텔 복귀, 2026-10-16 결정) ================= */

/**
 * 순차 경로 코스. 장소가 있으면 짐을 찾으러 호텔로 돌아온다(B1).
 * legs = [공항→호텔, 호텔→장소1, …, 장소N→호텔, 호텔→공항]  — legs.length === stays.length + 3
 * 장소 없으면 [공항→호텔, 호텔→공항]                           — legs.length === 2
 * stays = 장소별 체류(분). 호텔 체류(휴식·짐 찾기)는 넣지 않는다.
 */
export interface SequentialCourse {
  /** 코스 사용 시간(준비 제외) = Σlegs + Σstays + 체크인 대기 */
  usedMin: number;
  travelMin: number;
  stayMin: number;
  /** 체크인 슬롯을 기다린 분(alignCheckIn, 없으면 0) */
  waitMin: number;
  checkInAt: number;
  stops: { arriveAt: number; leaveAt: number }[];
  /** 마지막 장소에서 호텔로 출발하는 시각(장소 없으면 체크인) */
  lastDepartAt: number;
  /** 호텔 복귀 시각(장소 없으면 체크인) — 데이유즈 블록 종료 이하여야 한다 */
  hotelReturnAt: number;
  /** 마지막 장소 → 호텔 구간 분(장소 없으면 0) */
  hotelReturnLegMin: number;
  /** 복귀 도착 예상(공항) */
  returnAt: number;
  /** 공항 복귀 구간(호텔 → 공항) 분 */
  returnLegMin: number;
}

/** 순차 경로에 필요한 구간 수 */
export const sequentialLegCount = (stopCount: number) => (stopCount ? stopCount + 3 : 2);

export function sequentialCourse(startMin: number, legs: readonly number[], stays: readonly number[]): SequentialCourse {
  if (legs.length !== sequentialLegCount(stays.length)) throw new Error(`legs(${legs.length}) must be ${sequentialLegCount(stays.length)} for ${stays.length} stays`);
  let clock = startMin + COURSE_PREP_MIN + legs[0]!;
  const checkInAt = clock;
  const stops = stays.map((stay, i) => {
    clock += legs[i + 1]!;
    const arriveAt = clock;
    clock += stay;
    return { arriveAt, leaveAt: clock };
  });
  const lastDepartAt = clock;
  const hotelReturnLegMin = stays.length ? legs[legs.length - 2]! : 0;
  const hotelReturnAt = lastDepartAt + hotelReturnLegMin;
  const returnLegMin = legs[legs.length - 1]!;
  const travelMin = legs.reduce((a, b) => a + b, 0);
  const stayMin = stays.reduce((a, b) => a + b, 0);
  return {
    usedMin: travelMin + stayMin,
    travelMin,
    stayMin,
    waitMin: 0,
    checkInAt,
    stops,
    lastDepartAt,
    hotelReturnAt,
    hotelReturnLegMin,
    returnAt: hotelReturnAt + returnLegMin,
    returnLegMin,
  };
}

/**
 * 체크인 슬롯 정렬(2026-10-16 결정): 슬롯이 코스의 호텔 도착보다 늦으면 코스 전체를 그만큼 늦춘다.
 * 기다린 시간은 사용 시간에 넣는다(여유 < 0 ⇔ 복귀 늦음이 유지된다). 슬롯이 이르거나 같으면 그대로.
 */
export function alignCheckIn(course: SequentialCourse, checkInMin: number): SequentialCourse {
  const wait = Math.max(0, checkInMin - course.checkInAt);
  if (!wait) return course;
  return {
    ...course,
    usedMin: course.usedMin + wait,
    waitMin: course.waitMin + wait,
    checkInAt: course.checkInAt + wait,
    stops: course.stops.map((st) => ({ arriveAt: st.arriveAt + wait, leaveAt: st.leaveAt + wait })),
    lastDepartAt: course.lastDepartAt + wait,
    hotelReturnAt: course.hotelReturnAt + wait,
    returnAt: course.returnAt + wait,
  };
}

export interface ReturnPlan {
  /** 복귀 도착 목표 = Time-Safe returnBy */
  targetMin: number;
  /** 호텔 출발 기한 = 목표 − 호텔→공항 */
  hotelDepartureDeadlineMin: number;
  /** 마지막 장소(없으면 호텔) 출발 기한 = min(호텔 출발 기한, 블록 종료) − 마지막 장소→호텔 */
  lastDepartureDeadlineMin: number;
  /** 복귀 도착 예상이 목표보다 늦은가 */
  late: boolean;
  /** 늦은 분(늦지 않으면 0) */
  lateMin: number;
  /** 데이유즈 블록 종료(체크인 + 상품 시간). 고른 블록이 없으면 null */
  blockEndMin: number | null;
  /** 호텔 복귀가 블록 종료보다 늦은가(B1 제약) */
  blockOver: boolean;
  /** 블록 종료보다 늦은 분 */
  blockOverMin: number;
}

export function returnPlan(
  returnByMin: number,
  course: Pick<SequentialCourse, "returnAt" | "returnLegMin" | "hotelReturnAt" | "hotelReturnLegMin" | "stops">,
  blockEndMin: number | null = null,
): ReturnPlan {
  const lateMin = Math.max(0, course.returnAt - returnByMin);
  const hotelDepartureDeadlineMin = returnByMin - course.returnLegMin;
  const hasStops = course.stops.length > 0;
  const hotelBy = hasStops && blockEndMin != null ? Math.min(hotelDepartureDeadlineMin, blockEndMin) : hotelDepartureDeadlineMin;
  const blockOverMin = hasStops && blockEndMin != null ? Math.max(0, course.hotelReturnAt - blockEndMin) : 0;
  return {
    targetMin: returnByMin,
    hotelDepartureDeadlineMin,
    lastDepartureDeadlineMin: hotelBy - course.hotelReturnLegMin,
    late: lateMin > 0,
    lateMin,
    blockEndMin,
    blockOver: blockOverMin > 0,
    blockOverMin,
  };
}

/** 장소 목록 → 순차 구간 분 수(공항→호텔 … →호텔→공항). 구간 시간은 호출부가 캐시·근사로 공급한다 */
export type LegsFor<P> = (stops: readonly P[]) => number[];

/** 순차 경로 코스 사용 시간(준비 제외) */
export function sequentialUsedMin<P extends { durMin: number }>(legsFor: LegsFor<P>, stops: readonly P[]): number {
  return legsFor(stops).reduce((a, b) => a + b, 0) + stops.reduce((a, p) => a + p.durMin, 0);
}

/** 고른 데이유즈 블록이 있을 때의 호텔 복귀 제약: 공항 밖 시각 startMin, 체크인 슬롯 checkInMin(있으면 코스를 맞춤), 블록 종료 endMin */
export interface HotelBlockLimit {
  startMin: number;
  checkInMin?: number;
  endMin: number;
}

/** 순차 경로가 코스 가용 시간 안이고, 블록이 있으면 호텔 복귀 ≤ 블록 종료인가 */
export function fitsSequential<P extends { durMin: number }>(availableMin: number, legsFor: LegsFor<P>, stops: readonly P[], block?: HotelBlockLimit | null): boolean {
  const legs = legsFor(stops);
  const stays = stops.map((p) => p.durMin);
  const raw = sequentialCourse(block?.startMin ?? 0, legs, stays);
  const course = block?.checkInMin != null ? alignCheckIn(raw, block.checkInMin) : raw;
  if (course.usedMin > availableMin) return false;
  if (!block || !stops.length) return true;
  return course.hotelReturnAt <= block.endMin;
}

/** "환승 내 가능" — 담겨 있으면 현재 일정, 아니면 끝에 붙인 일정(…→마지막→후보→호텔→공항)이 제약 안인가 */
export function wouldFitSequential<P extends { id: string; durMin: number }>(
  availableMin: number,
  legsFor: LegsFor<P>,
  plan: readonly P[],
  candidate: P,
  block?: HotelBlockLimit | null,
): boolean {
  const inPlan = plan.some((p) => p.id === candidate.id);
  return fitsSequential(availableMin, legsFor, inPlan ? plan : [...plan, candidate], block);
}

/**
 * 순차 경로 자동 추천 — 카테고리 순서·정렬은 레거시 autoBuild와 같다
 * (정렬 키 rankMoveMin = 숙소→장소 분 + 체류). 판정만 순차 경로(호텔 복귀 포함) 제약.
 */
export function autoBuildSequential<P extends { id: string; cat: string; durMin: number; rankMoveMin: number }>(opts: {
  selected: readonly string[];
  interests: readonly string[];
  places: readonly P[];
  legsFor: LegsFor<P>;
  availableMin: number;
  block?: HotelBlockLimit | null;
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
      .sort((a, b) => a.rankMoveMin + a.durMin - (b.rankMoveMin + b.durMin))
      .find((p) => fitsSequential(opts.availableMin, opts.legsFor, [...chosen, p], opts.block));
    if (best) chosen.push(best);
  }
  return chosen;
}
