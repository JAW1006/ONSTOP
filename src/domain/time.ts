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

/** 레거시 parseHHMM: "HHMM"(3자리 이상) → 분. 마지막 2자리를 분, 나머지를 시로 본다. */
export function parseHHMM(s: string | null | undefined): number | null {
  if (!s || s.length < 3) return null;
  const h = parseInt(s.slice(0, s.length - 2), 10);
  const m = parseInt(s.slice(-2), 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}
