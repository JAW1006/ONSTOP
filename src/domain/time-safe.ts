// 공식: docs/formulas/time-safe.md · 용어: docs/GLOSSARY.md
import {
  ARRIVAL_IMMIGRATION_MIN,
  DEPARTURE_SECURITY_MIN,
  GATE_MARGIN_MIN,
  LAYOVER_BUDGET,
  LIVE_SECURITY_TERMINALS,
  MIN_STAY,
  MINUTES_PER_DAY,
} from "./constants";
import { diffFlightMin, parseFlightDateTime, type FlightClock } from "./time";

/** 공항 API의 항공편 시각 필드("HHMM" 또는 "YYYYMMDDHHMM") */
export interface FlightTimes {
  scheduleDateTime?: string | null;
  estimatedDateTime?: string | null;
}

/** 도착 시각 = 실시간 예상 우선, 없으면 예정 */
export function effectiveArrival(f: FlightTimes): FlightClock | null {
  return parseFlightDateTime(f.estimatedDateTime) ?? parseFlightDateTime(f.scheduleDateTime);
}

/** 출발 시각 = 실시간 예상 우선, 단 예정보다 이르면 예정으로 올린다(조기 출발은 믿지 않음) */
export function effectiveDeparture(f: FlightTimes): FlightClock | null {
  const sched = parseFlightDateTime(f.scheduleDateTime);
  const est = parseFlightDateTime(f.estimatedDateTime);
  if (est && sched) return diffFlightMin(est, sched) < 0 ? sched : est;
  return est ?? sched;
}

/** 예정 대비 지연(분). 지연이 아니면 0 */
export function flightDelayMin(f: FlightTimes): number {
  const sched = parseFlightDateTime(f.scheduleDateTime);
  const est = parseFlightDateTime(f.estimatedDateTime);
  if (!sched || !est) return 0;
  return Math.max(0, diffFlightMin(est, sched));
}

export type ConnectionWarning = "OVER_24H" | "DEPART_BEFORE_ARRIVAL";

export interface ResolvedConnection {
  /** 도착 시각(분, 도착일 0시 기준) */
  arriveMin: number;
  /** 연결편 출발 시각(분, 도착일 0시 기준 — 익일이면 1440 이상). 연결편 없음/파싱 실패면 null */
  departMin: number | null;
  departNextDay: boolean;
  warning: ConnectionWarning | null;
}

/**
 * 도착편·연결편을 도착일 0시 기준 분으로 맞춘다.
 * - 둘 다 날짜가 있으면 날짜로 계산
 * - 하나라도 날짜가 없으면, 출발 < 도착일 때만 출발을 다음 날로 본다
 * - 도착~출발이 24시간 초과면 OVER_24H, 출발이 도착보다 앞서면 DEPART_BEFORE_ARRIVAL 경고
 */
export function resolveConnection(arrival: FlightTimes, departure: FlightTimes | null): ResolvedConnection | null {
  const a = effectiveArrival(arrival);
  if (!a) return null;
  const d = departure ? effectiveDeparture(departure) : null;
  if (!d) return { arriveMin: a.min, departMin: null, departNextDay: false, warning: null };

  let departMin: number;
  if (a.day != null && d.day != null) {
    departMin = (d.day - a.day) * MINUTES_PER_DAY + d.min;
  } else {
    departMin = d.min < a.min ? d.min + MINUTES_PER_DAY : d.min;
  }
  const total = departMin - a.min;
  const warning: ConnectionWarning | null =
    total > MINUTES_PER_DAY ? "OVER_24H" : total < 0 ? "DEPART_BEFORE_ARRIVAL" : null;
  return { arriveMin: a.min, departMin, departNextDay: departMin >= MINUTES_PER_DAY, warning };
}

/** T1 출국장 게이트별 대기시간의 평균(분, 반올림). 게이트가 없으면 null */
export function averageSecurityWaitMin(gates: { waitTimeMin: number }[]): number | null {
  if (!gates.length) return null;
  return Math.round(gates.reduce((sum, g) => sum + g.waitTimeMin, 0) / gates.length);
}

/** Time-Safe 버퍼 3개 구성 요소(분) */
export interface TimeSafeBuffers {
  /** ① 입국심사(도착 후, 짐 찾기 포함) */
  arrivalImmigrationMin: number;
  /** ② 보안검색·출국심사(복귀 후) — T1 실시간 대기의 하한 */
  departureSecurityMin: number;
  /** ③ 게이트 여유 */
  gateMarginMin: number;
}

export const DEFAULT_BUFFERS: TimeSafeBuffers = {
  arrivalImmigrationMin: ARRIVAL_IMMIGRATION_MIN,
  departureSecurityMin: DEPARTURE_SECURITY_MIN,
  gateMarginMin: GATE_MARGIN_MIN,
};

/**
 * ② 보안검색·출국심사: 기준값을 하한으로 두고, 연결편이 T1·T2이고 실시간 값이 있으면 더 큰 쪽을 쓴다.
 * 실시간 값은 조회 시점의 그 터미널 전체 게이트 평균이라 실제 게이트·복귀 시점 값이 아니다(time-safe.md 엣지 케이스).
 */
export function securityBufferMin(
  departureTerminal: string | null,
  liveWaitMin: number | null,
  baseMin: number = DEPARTURE_SECURITY_MIN,
): number {
  if (!liveSecurityTerminal(departureTerminal) || liveWaitMin == null) return baseMin;
  return Math.max(baseMin, liveWaitMin);
}

/** 실시간 대기시간이 실제로 버퍼를 올렸는가(화면의 "실시간 반영" 배지용) */
export function isLiveSecurityApplied(
  departureTerminal: string | null,
  liveWaitMin: number | null,
  baseMin: number = DEPARTURE_SECURITY_MIN,
): boolean {
  return !!liveSecurityTerminal(departureTerminal) && liveWaitMin != null && liveWaitMin > baseMin;
}

/** 연결편 터미널이 실시간 출국장 대기를 제공하면 "T1"/"T2", 아니면 null */
export function liveSecurityTerminal(departureTerminal: string | null): "T1" | "T2" | null {
  return (departureTerminal && LIVE_SECURITY_TERMINALS[departureTerminal]) || null;
}

export interface TimeSafeInput {
  arriveMin: number;
  departMin: number | null;
  departureTerminal: string | null;
  liveSecurityWaitMin: number | null;
}

export interface TimeSafeResult {
  arrivalImmigrationMin: number;
  /** ② 실제 적용값(실시간 하한 반영 후) */
  securityMin: number;
  gateMarginMin: number;
  /** 복귀 쪽 버퍼 = ② + ③ */
  returnBufferMin: number;
  /** 공항 밖으로 나가는 시각 = 도착 + ① */
  exitAtMin: number;
  canGoOut: boolean;
  /** 공항 복귀 추천 시각 = 출발 − 복귀 버퍼 (외출 불가면 exitAt) */
  returnByMin: number;
  /** 외출 가능 시간 = 복귀 추천 시각 − 공항 밖으로 나가는 시각 (외출 불가면 0) */
  outingMin: number;
  /** 도착~연결편 출발 총 시간(연결편 없으면 null) */
  totalConnectionMin: number | null;
}

export function computeTimeSafe(input: TimeSafeInput, buffers: TimeSafeBuffers = DEFAULT_BUFFERS): TimeSafeResult {
  const securityMin = securityBufferMin(
    input.departureTerminal,
    input.liveSecurityWaitMin,
    buffers.departureSecurityMin,
  );
  const returnBufferMin = securityMin + buffers.gateMarginMin;
  const exitAtMin = input.arriveMin + buffers.arrivalImmigrationMin;

  let canGoOut: boolean;
  let returnByMin: number;
  if (input.departMin == null) {
    canGoOut = true;
    returnByMin = input.arriveMin + LAYOVER_BUDGET;
  } else {
    canGoOut = input.departMin - returnBufferMin - exitAtMin >= MIN_STAY;
    returnByMin = canGoOut ? input.departMin - returnBufferMin : exitAtMin;
  }

  return {
    arrivalImmigrationMin: buffers.arrivalImmigrationMin,
    securityMin,
    gateMarginMin: buffers.gateMarginMin,
    returnBufferMin,
    exitAtMin,
    canGoOut,
    returnByMin,
    outingMin: Math.max(0, returnByMin - exitAtMin),
    totalConnectionMin: input.departMin == null ? null : input.departMin - input.arriveMin,
  };
}
