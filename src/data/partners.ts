// 호텔 참여 상태·연락처·취소 규정·가격표 — 인터뷰로 채운다(docs/design/data-verification.md 수동 입력 구역).
// 구조: docs/formulas/dayuse-pricing.md "호텔별 데이터". 노출 규칙: docs/design/screens/booking.md "호텔 참여 상태와 노출".
import type { DayuseOffer } from "@/domain/dayuse-pricing";
import demoRaw from "./demo-offers.json";
import partnersRaw from "./hotel-partners.json";
import { ROOMS, type Localized, type Room } from "./index";

export type Participation = "confirmed" | "negotiating" | "none";

export interface HotelPartner {
  /** 운영은 confirmed만 노출. 확인 전 기본값 none */
  participation: Participation;
  /** 예약·취소 담당 연락처(앱 표시 허락받은 것만) */
  contact?: { phone?: string; email?: string; note?: Localized };
  /** 확정 후 취소 규정 — 없으면 "규정 확인 중" */
  cancellationPolicy?: Localized;
  /** 호텔 가격표 — 없으면 견적 요청 */
  offer?: DayuseOffer;
}

const PARTNERS = partnersRaw as Record<string, HotelPartner>;
/** 데모용 가격표(사용자가 채움) — 데모 모드에서만 쓴다 */
const DEMO_OFFERS = (demoRaw as { offers: Record<string, DayuseOffer> }).offers;

export const partnerOf = (roomId: string): HotelPartner => PARTNERS[roomId] ?? { participation: "none" };

/** 화면에 노출할 숙소 — 운영은 참여 확정만, 데모는 전부 */
export function listedRooms(demo: boolean): Room[] {
  return demo ? ROOMS : ROOMS.filter((r) => partnerOf(r.id).participation === "confirmed");
}

export const isListed = (roomId: string, demo: boolean) => listedRooms(demo).some((r) => r.id === roomId);

/** 가격표와 출처. 운영은 호텔 데이터만, 데모는 호텔 데이터 → 데모 가격표 순. 둘 다 없으면 견적 요청 */
export function offerFor(roomId: string, demo: boolean): { offer: DayuseOffer | null; source: "hotel" | "demo" | null } {
  const hotel = partnerOf(roomId).offer;
  if (hotel?.products.length) return { offer: hotel, source: "hotel" };
  const demoOffer = demo ? DEMO_OFFERS[roomId] : undefined;
  if (demoOffer?.products.length) return { offer: demoOffer, source: "demo" };
  return { offer: null, source: null };
}
