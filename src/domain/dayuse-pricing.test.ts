// 기댓값은 docs/formulas/dayuse-pricing.md "예시" 표와 같은 숫자다.
import { describe, expect, it } from "vitest";
import {
  bookingCheck,
  checkInSlots,
  defaultProduct,
  defaultTier,
  earliestCheckInMin,
  hourStepPrice,
  isCheckoutPastReturn,
  minutesOfDay,
  offerProducts,
  productStartsAt,
  roomHourTiers,
} from "./dayuse-pricing";
import { hhmm } from "./time";
import { sequentialCourse } from "./time-fit";

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

// A9 가격표 + 예약 시각 계산 — docs/formulas/dayuse-pricing.md "예약 시각 계산" 예시 BK1–BK6과 같은 숫자
describe("A9 가격표·예약 시각 계산", () => {
  const P3 = { hours: 3, price: 50000, vatIncluded: true };
  const P4 = { hours: 4, price: 58000, vatIncluded: true, startWindow: { from: "12:00", to: "14:00" } };
  const P6 = { hours: 6, price: 80000, vatIncluded: true };
  const offer = {
    products: [P6, P3, P4],
    includes: ["shower"],
    source: { date: "2026-10-16", method: "demo" as const, by: "test" },
  };
  // time-fit S3: 공항 밖 11:20, 구간 18·12·8·8·18, 체류 25·20 → 체크인 11:58, 숙소 복귀 13:11, 공항 13:29
  const s3 = () => sequentialCourse(680, [18, 12, 8, 8, 18], [25, 20]);
  const RETURN_BY = 811;

  it("가격표는 그대로(시간 짧은 순), 없으면 빈 배열 = 견적 요청", () => {
    expect(offerProducts(offer).map((p) => p.hours)).toEqual([3, 4, 6]);
    expect(offerProducts(null)).toEqual([]);
    expect(offerProducts({ ...offer, products: [] })).toEqual([]);
  });

  it("BK1 슬롯은 코스 체크인(11:58) 이후 12:00부터 30분 간격", () => {
    expect(checkInSlots(s3().checkInAt).map(hhmm)).toEqual(["12:00", "12:30", "13:00", "13:30", "14:00", "14:30"]);
  });

  it("BK2 슬롯 12:00 + 3h: 대기 2분 → 숙소 복귀 13:13, 공항 13:31(늦지 않음), 이용 종료 15:00, 기본 상품 3h", () => {
    expect(defaultProduct(offerProducts(offer), 720, RETURN_BY)).toBe(P3);
    const r = bookingCheck(s3(), 720, P3, RETURN_BY);
    expect(r.course.waitMin).toBe(2);
    expect(hhmm(r.course.hotelReturnAt)).toBe("13:13");
    expect(hhmm(r.course.returnAt)).toBe("13:31");
    expect(hhmm(r.endMin)).toBe("15:00");
    expect(r.plan).toMatchObject({ late: false, blockOver: false });
  });

  it("BK3 슬롯 12:30 + 3h: 코스 전체 32분 지연 → 숙소 복귀 13:43, 공항 14:01(30분 늦음), 블록 초과 없음", () => {
    const r = bookingCheck(s3(), 750, P3, RETURN_BY);
    expect(hhmm(r.course.hotelReturnAt)).toBe("13:43");
    expect(hhmm(r.course.returnAt)).toBe("14:01");
    expect(r.plan).toMatchObject({ late: true, lateMin: 30, blockOver: false });
  });

  it("BK4 견적 요청 슬롯 12:30: 이용 종료 = 숙소 출발 기한 13:13 → 블록 초과 30분 + 늦음 30분", () => {
    const r = bookingCheck(s3(), 750, null, RETURN_BY);
    expect(hhmm(r.endMin)).toBe("13:13");
    expect(r.plan).toMatchObject({ blockOver: true, blockOverMin: 30, late: true, lateMin: 30 });
  });

  it("BK5 시작 가능 시각: 4h는 12:00–14:00만, 기본 상품은 시작 가능한 것 중 기존 규칙", () => {
    expect([690, 720, 840, 870].map((t) => productStartsAt(P4, t))).toEqual([false, true, true, false]);
    expect(defaultProduct(offerProducts(offer), 720, 1100)).toBe(P6);
    expect(defaultProduct(offerProducts(offer), 870, 1100)).toBe(P3);
    expect(defaultProduct([P4], 870, 1100)).toBeNull();
    expect(minutesOfDay("24:00")).toBeNull();
    expect(minutesOfDay("09:30")).toBe(570);
  });

  it("BK6 코스 없음(장소 0개, 공항↔호텔 근사 19): 체크인 11:59, 슬롯 12:00 + 3h → 블록 제약 없음, 공항 12:19", () => {
    const c = sequentialCourse(680, [19, 19], []);
    expect(hhmm(c.checkInAt)).toBe("11:59");
    const r = bookingCheck(c, 720, P3, RETURN_BY);
    expect(r.plan.blockOver).toBe(false);
    expect(hhmm(r.course.returnAt)).toBe("12:19");
  });
});
