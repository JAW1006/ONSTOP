// 공식: docs/formulas/dayuse-pricing.md
import { CHECKIN_SLOT_COUNT, CHECKIN_SLOT_STEP, COURSE_PREP_MIN, MINUTES_PER_DAY, TIER_PRICE_ROUND_KRW, TIER_STEP_RATIO } from "./constants";
import { alignCheckIn, returnPlan, type ReturnPlan, type SequentialCourse } from "./time-fit";

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
export function earliestCheckInMin(exitAtMin: number, roomMoveMin: number): number {
  return exitAtMin + COURSE_PREP_MIN + roomMoveMin;
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

/* ================= A9 — 호텔 가격표 그대로 (2026-10-16 결정) ================= */

/** 언어별 글(데이터 Localized와 같은 모양, domain은 data를 import하지 않는다) */
export type LocalizedText = Record<string, string>;

/** 호텔이 실제로 판매하는 블록 하나 */
export interface DayuseProduct {
  /** 블록 길이(시간) — 판매 그대로 */
  hours: number;
  /** 판매가(원) */
  price: number;
  vatIncluded: boolean;
  /** 이 블록을 시작할 수 있는 시각("HH:MM"–"HH:MM", 같은 날) */
  startWindow?: { from: string; to: string };
  conditions?: LocalizedText;
}

/** 숙소별 데이유즈 가격표·규정 */
export interface DayuseOffer {
  /** 비어 있으면 견적 요청 모드 */
  products: DayuseProduct[];
  includes: string[];
  extension?: { allowed: boolean; pricePerHour?: number; note?: LocalizedText };
  cancellation?: LocalizedText;
  noShow?: LocalizedText;
  requestResponse?: { typicalMinutes?: number; hours?: string };
  source: { date: string; method: "interview" | "contract" | "pricelist" | "demo"; by: string };
}

/** "HH:MM" → 그날 0시부터 분. 형식이 틀리면 null */
export function minutesOfDay(s: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h < 24 && min < 60 ? h * 60 + min : null;
}

/** 이 체크인 슬롯에 시작할 수 있는 상품인가(startWindow 없으면 언제나). 슬롯은 도착일 기준 분(하루 넘김 허용) */
export function productStartsAt(product: DayuseProduct, checkInMin: number): boolean {
  if (!product.startWindow) return true;
  const from = minutesOfDay(product.startWindow.from);
  const to = minutesOfDay(product.startWindow.to);
  if (from == null || to == null) return false;
  const t = ((checkInMin % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return from <= to ? t >= from && t <= to : t >= from || t <= to;
}

/** 가격표 상품(시간 짧은 순). 가격표가 없으면 빈 배열 → 견적 요청 */
export function offerProducts(offer: DayuseOffer | null | undefined): DayuseProduct[] {
  return [...(offer?.products ?? [])].sort((a, b) => a.hours - b.hours || a.price - b.price);
}

/**
 * 기본 선택(기존 규칙 유지): 이 슬롯에 시작할 수 있는 상품 중
 * 슬롯 + 시간 ≤ 복귀 목표인 가장 긴 상품, 없으면 가장 짧은 상품. 시작할 수 있는 상품이 없으면 null.
 */
export function defaultProduct(products: readonly DayuseProduct[], checkInMin: number, returnByMin: number): DayuseProduct | null {
  const startable = products.filter((p) => productStartsAt(p, checkInMin)).sort((a, b) => a.hours - b.hours);
  return [...startable].reverse().find((p) => checkInMin + p.hours * 60 <= returnByMin) ?? startable[0] ?? null;
}

/** 이용 종료: 상품 요청 = 슬롯 + 상품 시간, 견적 요청 = 숙소 출발 기한 */
export function blockEndMin(checkInMin: number, product: DayuseProduct | null, hotelDepartureDeadlineMin: number): number {
  return product ? checkInMin + Math.round(product.hours * 60) : hotelDepartureDeadlineMin;
}

export interface BookingCheck {
  /** 슬롯에 맞춘 코스 */
  course: SequentialCourse;
  plan: ReturnPlan;
  /** 이용 종료 */
  endMin: number;
}

/**
 * 예약 시각 계산 — 코스를 슬롯에 맞추고(늦으면 코스 전체 지연), 이용 종료와 숙소 복귀·공항 복귀를 비교한다.
 * course는 순차 경로 코스(진입 ②면 장소 없는 코스). product가 null이면 견적 요청.
 */
export function bookingCheck(course: SequentialCourse, checkInMin: number, product: DayuseProduct | null, returnByMin: number): BookingCheck {
  const aligned = alignCheckIn(course, checkInMin);
  const end = blockEndMin(checkInMin, product, returnByMin - aligned.returnLegMin);
  return { course: aligned, plan: returnPlan(returnByMin, aligned, end), endMin: end };
}
