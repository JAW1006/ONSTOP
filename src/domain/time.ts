import { MINUTES_PER_DAY } from "./constants";

/** 분(도착일 0시 기준, 음수·하루 초과 허용) → "HH:MM" */
export function hhmm(min: number): string {
  const m = ((min % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** 도착일 기준 며칠 뒤인지(0 = 당일, 1 = 익일) */
export function dayOffset(min: number): number {
  return Math.floor(min / MINUTES_PER_DAY);
}

/** 항공편 시각. day = 달력 날짜(1970-01-01부터 일수), 날짜가 없으면 null. min = 그날 0시부터 분 */
export interface FlightClock {
  day: number | null;
  min: number;
}

/**
 * 공항 API 시각 문자열 파싱.
 * - "YYYYMMDDHHMM"(12자리) → 날짜 포함
 * - "HHMM" 또는 "HMM"(3–4자리) → 날짜 없음
 * 그 외·범위 밖(시 ≥ 24, 분 ≥ 60)은 null.
 */
export function parseFlightDateTime(s: string | null | undefined): FlightClock | null {
  const v = s?.trim() ?? "";
  let day: number | null = null;
  let time: string;
  if (/^\d{12}$/.test(v)) {
    const y = Number(v.slice(0, 4));
    const mo = Number(v.slice(4, 6));
    const d = Number(v.slice(6, 8));
    const ms = Date.UTC(y, mo - 1, d);
    const check = new Date(ms);
    if (check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) return null;
    day = ms / 86_400_000;
    time = v.slice(8);
  } else if (/^\d{3,4}$/.test(v)) {
    time = v;
  } else {
    return null;
  }
  const h = Number(time.slice(0, -2));
  const m = Number(time.slice(-2));
  if (h >= 24 || m >= 60) return null;
  return { day, min: h * 60 + m };
}

/**
 * a − b (분). 둘 다 날짜가 있으면 날짜로 계산하고,
 * 하나라도 없으면 12시간 이내의 가장 가까운 차이로 본다(23:50 → 00:10 = +20).
 */
export function diffFlightMin(a: FlightClock, b: FlightClock): number {
  if (a.day != null && b.day != null) return (a.day - b.day) * MINUTES_PER_DAY + a.min - b.min;
  let d = a.min - b.min;
  if (d < -MINUTES_PER_DAY / 2) d += MINUTES_PER_DAY;
  else if (d > MINUTES_PER_DAY / 2) d -= MINUTES_PER_DAY;
  return d;
}
