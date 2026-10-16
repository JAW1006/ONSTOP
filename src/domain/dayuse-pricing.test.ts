// 기댓값은 docs/formulas/dayuse-pricing.md "예시" 표와 같은 숫자다.
import { describe, expect, it } from "vitest";
import {
  checkInSlots,
  defaultTier,
  earliestCheckInMin,
  hourStepPrice,
  isCheckoutPastReturn,
  roomHourTiers,
} from "./dayuse-pricing";

const aura = { price: 50000, hourMin: 3, hourMax: 9 };
const westernGrace = { price: 43000, hourMin: 3, hourMax: 6 };

describe("타임블록 가격 — 기존 동작", () => {
  it("#1 호텔 오라: 1시간 추가 8,000원, 3h 50,000 ~ 9h 98,000", () => {
    expect(hourStepPrice(aura)).toBe(8000);
    expect(roomHourTiers(aura)).toEqual([
      { hours: 3, price: 50000 },
      { hours: 4, price: 58000 },
      { hours: 5, price: 66000 },
      { hours: 6, price: 74000 },
      { hours: 7, price: 82000 },
      { hours: 8, price: 90000 },
      { hours: 9, price: 98000 },
    ]);
  });
  it("#2 웨스턴그레이스: 7,166.67 → 7,000원 반올림", () => {
    expect(hourStepPrice(westernGrace)).toBe(7000);
    expect(roomHourTiers(westernGrace).map((t) => t.price)).toEqual([43000, 50000, 57000, 64000]);
  });
});

describe("체크인 — 기존 동작", () => {
  it("#3 공항 밖 10:30, 이동 16분 → 11:06 가능, 후보 11:30부터 30분 간격 6개", () => {
    const earliest = earliestCheckInMin(630, 16);
    expect(earliest).toBe(666);
    expect(checkInSlots(earliest)).toEqual([690, 720, 750, 780, 810, 840]);
  });
  it("정각이면 그대로 시작", () => {
    expect(checkInSlots(690)[0]).toBe(690);
  });
});

describe("기본 상품 선택 — 기존 동작", () => {
  const tiers = roomHourTiers(aura);
  it("#4 남는 시간 121분 → 들어가는 상품 없음 → 최소 3h + 체크아웃 초과 경고", () => {
    expect(defaultTier(tiers, 690, 811).hours).toBe(3);
    expect(isCheckoutPastReturn(690, 3, 811)).toBe(true);
  });
  it("#5 남는 시간 410분 → 6h(360) 선택, 경고 없음", () => {
    expect(defaultTier(tiers, 690, 1100).hours).toBe(6);
    expect(isCheckoutPastReturn(690, 6, 1100)).toBe(false);
  });
});
