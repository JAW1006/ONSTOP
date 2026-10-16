// 공식: docs/formulas/time-safe.md
import {
  GATE_CUTOFF_MIN,
  LAYOVER_BUDGET,
  LIVE_SECURITY_TERMINAL,
  MIN_STAY,
  SECURITY_BUFFER_MIN,
} from "./constants";
import { parseHHMM } from "./time";

/** 공항 API의 항공편 시각 필드(HHMM) */
export interface FlightTimes {
  scheduleDateTime?: string | null;
  estimatedDateTime?: string | null;
}

/** 도착 시각 = 실시간 예상 우선, 없으면 예정 */
export function effectiveArrivalMin(f: FlightTimes): number | null {
  return parseHHMM(f.estimatedDateTime) ?? parseHHMM(f.scheduleDateTime);
}

/** 출발 시각 = 실시간 예상 우선, 단 예정보다 이르면 예정으로 올린다(조기 출발은 믿지 않음) */
export function effectiveDepartureMin(f: FlightTimes): number | null {
  const sched = parseHHMM(f.scheduleDateTime);
  const est = parseHHMM(f.estimatedDateTime);
  const depart = est ?? sched;
  if (depart == null) return null;
  return sched != null && depart < sched ? sched : depart;
}

/** 예정 대비 지연(분). 지연이 아니면 0 */
export function flightDelayMin(f: FlightTimes): number {
  const sched = parseHHMM(f.scheduleDateTime);
  const est = parseHHMM(f.estimatedDateTime);
  if (sched == null || est == null) return 0;
  return Math.max(0, est - sched);
}

/** T1 출국장 게이트별 대기시간의 평균(분, 반올림). 게이트가 없으면 null */
export function averageSecurityWaitMin(gates: { waitTimeMin: number }[]): number | null {
  if (!gates.length) return null;
  return Math.round(gates.reduce((sum, g) => sum + g.waitTimeMin, 0) / gates.length);
}

/** 수속 버퍼: 연결편이 T1이고 실시간 값이 있으면 그 값으로 대체, 아니면 SECURITY_BUFFER_MIN */
export function securityBufferMin(departureTerminal: string | null, liveWaitMin: number | null): number {
  return departureTerminal === LIVE_SECURITY_TERMINAL && liveWaitMin != null ? liveWaitMin : SECURITY_BUFFER_MIN;
}

export interface ConnectionInfo {
  canGoOut: boolean;
  returnByMin: number;
}

/** 레거시 connectionInfo — 외출 가능 여부와 공항 복귀 추천 시각 */
export function connectionInfo(arriveMin: number, departMin: number | null, bufferMin: number): ConnectionInfo {
  if (departMin == null) return { canGoOut: true, returnByMin: arriveMin + LAYOVER_BUDGET };
  const canGoOut = departMin - bufferMin - arriveMin >= MIN_STAY;
  return { canGoOut, returnByMin: canGoOut ? departMin - bufferMin : arriveMin };
}

export interface TimeSafeInput {
  arriveMin: number;
  departMin: number | null;
  departureTerminal: string | null;
  liveSecurityWaitMin: number | null;
}

export interface TimeSafeResult extends ConnectionInfo {
  securityMin: number;
  bufferMin: number;
  /** 홈·온보딩에 표시되는 체류 가능 시간 = returnBy − arrive */
  stayMin: number;
  /** 도착~연결편 출발 총 시간(연결편 없으면 null) */
  totalConnectionMin: number | null;
}

export function computeTimeSafe(input: TimeSafeInput): TimeSafeResult {
  const securityMin = securityBufferMin(input.departureTerminal, input.liveSecurityWaitMin);
  const bufferMin = securityMin + GATE_CUTOFF_MIN;
  const info = connectionInfo(input.arriveMin, input.departMin, bufferMin);
  return {
    ...info,
    securityMin,
    bufferMin,
    stayMin: info.returnByMin - input.arriveMin,
    totalConnectionMin: input.departMin == null ? null : input.departMin - input.arriveMin,
  };
}
