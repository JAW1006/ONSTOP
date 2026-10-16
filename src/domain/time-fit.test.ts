// 기댓값은 docs/formulas/time-fit.md "예시" 표와 같은 숫자다.
import { describe, expect, it } from "vitest";
import { autoBuild, buildCourseTimeline, courseUsedMin, wouldFit } from "./time-fit";
import { haversineKm, liveEstimateMin, pickTravelMode, routeSecToMin, transitMin, walkMin } from "./travel";

// 레거시 데이터 그대로(ROOMS/PLACES의 move·dur)
const AURA_MOVE = 16;
const footShop = { id: "airport-spa-foot", cat: "Massage", move: 13, dur: 60 };
const wonbo = { id: "chinatown-dimsum", cat: "Food", move: 40, dur: 45 };
const places = [
  { id: "sky72-outlet", cat: "Shopping", move: 14, dur: 60 },
  { id: "olive-young-kbeauty", cat: "Shopping", move: 17, dur: 30 },
  { id: "shinsegae-dutyfree", cat: "Shopping", move: 13, dur: 30 },
  wonbo,
  { id: "sinpo-market", cat: "Food", move: 42, dur: 30 },
  { id: "yeongjong-noodles", cat: "Food", move: 16, dur: 45 },
];

describe("courseUsedMin — 기존 동작", () => {
  it("#1 숙소만: 20 + 16 + 16 = 52", () => {
    expect(courseUsedMin(AURA_MOVE, [])).toBe(52);
  });
  it("#2 숙소 + 더풋샵: 20 + 16 + (13+60) + 13 = 122", () => {
    expect(courseUsedMin(AURA_MOVE, [footShop])).toBe(122);
  });
  it("#3 숙소 + 원보만두 + 더풋샵: 207 (복귀는 마지막 장소 move 재사용)", () => {
    expect(courseUsedMin(AURA_MOVE, [wonbo, footShop])).toBe(207);
  });
  it("#4 숙소·장소 없음: PREP만 20", () => {
    expect(courseUsedMin(null, [])).toBe(20);
  });
});

describe("wouldFit", () => {
  it("예산 181에서 원보만두+더풋샵(207)은 초과", () => {
    expect(wouldFit(181, AURA_MOVE, [wonbo], footShop)).toBe(false);
    expect(wouldFit(181, AURA_MOVE, [], footShop)).toBe(true);
  });
  it("이미 담긴 장소는 현재 일정으로 판단", () => {
    expect(wouldFit(122, AURA_MOVE, [footShop], footShop)).toBe(true);
  });
});

describe("buildCourseTimeline — 기존 동작", () => {
  it("#5 10:30 도착, 숙소 16분, 더풋샵", () => {
    const t = buildCourseTimeline(630, AURA_MOVE, [footShop]);
    expect(t.checkInAt).toBe(666);
    expect(t.stops).toEqual([{ arriveAt: 679, leaveAt: 739 }]);
    expect(t.returnAt).toBe(752);
    expect(t.usedMin).toBe(courseUsedMin(AURA_MOVE, [footShop]));
  });
});

describe("autoBuild — 기존 동작(탐욕법)", () => {
  it("#6 예산 181, 관심사 [Shopping, Rest], 선택 [Food, Shopping] → 다이소, 7곡제면소", () => {
    const r = autoBuild({ selected: ["Food", "Shopping"], interests: ["Shopping", "Rest"], places, roomMove: AURA_MOVE, budgetMin: 181 });
    expect(r.map((p) => p.id)).toEqual(["shinsegae-dutyfree", "yeongjong-noodles"]);
    expect(courseUsedMin(AURA_MOVE, r)).toBe(156);
  });
  it("#7 예산 100 → 다이소만", () => {
    const r = autoBuild({ selected: ["Food", "Shopping"], interests: ["Shopping", "Rest"], places, roomMove: AURA_MOVE, budgetMin: 100 });
    expect(r.map((p) => p.id)).toEqual(["shinsegae-dutyfree"]);
  });
  it("선택 카테고리가 없으면 ACT_KEYS 전체", () => {
    const r = autoBuild({ selected: [], interests: [], places, roomMove: AURA_MOVE, budgetMin: 1000 });
    expect(r.map((p) => p.cat)).toEqual(["Food", "Shopping"]);
  });
});

describe("이동시간 — 기존 동작", () => {
  const AIRPORT = { lat: 37.446, lng: 126.4522 };
  const AURA = { lat: 37.454078, lng: 126.41785 };
  const FOOT = { lat: 37.493477, lng: 126.492223 };
  const OLIVE = { lat: 37.49253118561955, lng: 126.49284529121837 };
  const CHINATOWN = { lat: 37.475256, lng: 126.618969 };

  it("#8 직선거리와 이동수단 분기", () => {
    expect(haversineKm(AIRPORT, AURA)).toBeCloseTo(3.1625, 3);
    expect(pickTravelMode(haversineKm(FOOT, OLIVE))).toBe("walk");
    expect(pickTravelMode(haversineKm(AIRPORT, AURA))).toBe("drive");
    expect(pickTravelMode(haversineKm(AURA, CHINATOWN))).toBe("transit");
    expect(pickTravelMode(1.2)).toBe("walk");
    expect(pickTravelMode(6)).toBe("transit");
  });
  it("#9 분 환산(최소 1분)", () => {
    expect(walkMin(haversineKm(FOOT, OLIVE))).toBe(2);
    expect(walkMin(0)).toBe(1);
    expect(liveEstimateMin(haversineKm(AIRPORT, AURA))).toBe(6);
    expect(routeSecToMin(780)).toBe(13);
    expect(routeSecToMin(10)).toBe(1);
    expect(transitMin(52.4)).toBe(52);
  });
});
