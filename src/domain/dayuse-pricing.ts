// 공식: docs/formulas/dayuse-pricing.md
import { CHECKIN_SLOT_COUNT, CHECKIN_SLOT_STEP, COURSE_PREP_MIN, TIER_PRICE_ROUND_KRW, TIER_STEP_RATIO } from "./constants";

export interface DayuseRoomPricing {
  /** hourMin 기준 기본가(원) */
  price: number;
  hourMin: number;
  hourMax: number;
}

export interface HourTier {
  hours: number;
  price: number;
}

/** 1시간 추가 가격 = round(기본가 ÷ 기본시간 × TIER_STEP_RATIO ÷ 1000) × 1000 */
export function hourStepPrice(room: DayuseRoomPricing): number {
  return Math.round(((room.price / room.hourMin) * TIER_STEP_RATIO) / TIER_PRICE_ROUND_KRW) * TIER_PRICE_ROUND_KRW;
}

/** hourMin..hourMax 정시간 상품 목록 */
export function roomHourTiers(room: DayuseRoomPricing): HourTier[] {
  const step = hourStepPrice(room);
  const tiers: HourTier[] = [];
  for (let h = room.hourMin; h <= room.hourMax; h++) {
    tiers.push({ hours: h, price: room.price + (h - room.hourMin) * step });
  }
  return tiers;
}

/** 가장 이른 체크인 = 공항 밖으로 나가는 시각(Time-Safe exitAt) + COURSE_PREP_MIN + 공항→숙소 이동 */
export function earliestCheckInMin(exitAtMin: number, roomMove: number): number {
  return exitAtMin + COURSE_PREP_MIN + roomMove;
}

/** 체크인 후보: 가장 이른 체크인 이후 첫 30분 정각부터 30분 간격 6개 */
export function checkInSlots(earliestMin: number): number[] {
  const start = Math.ceil(earliestMin / CHECKIN_SLOT_STEP) * CHECKIN_SLOT_STEP;
  return Array.from({ length: CHECKIN_SLOT_COUNT }, (_, i) => start + i * CHECKIN_SLOT_STEP);
}

/** 기본 선택: 복귀 시각 전까지 남는 시간 안에 들어가는 가장 긴 상품, 없으면 가장 짧은 상품 */
export function defaultTier(tiers: readonly HourTier[], checkInMin: number, returnByMin: number): HourTier {
  const available = returnByMin - checkInMin;
  const fit = [...tiers].reverse().find((t) => t.hours * 60 <= available);
  const fallback = tiers[0];
  if (!fallback) throw new Error("tiers must not be empty");
  return fit ?? fallback;
}

/** 체크아웃이 복귀 추천 시각을 넘는가(경고 배너) */
export function isCheckoutPastReturn(checkInMin: number, hours: number, returnByMin: number): boolean {
  return checkInMin + hours * 60 > returnByMin;
}
