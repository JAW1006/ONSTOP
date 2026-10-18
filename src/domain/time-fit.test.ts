// 기댓값은 docs/formulas/time-fit.md "예시" 표와 같은 숫자다.
import { describe, expect, it } from "vitest";
import {
  autoBuild,
  buildCourseTimeline,
  courseAvailableMin,
  courseUsedMin,
  scheduleSummary,
  wouldFit,
} from "./time-fit";
import { haversineKm, liveEstimateMin, pickTravelMode, routeSecToMin, transitMin, walkMin } from "./travel";

// 레거시 데이터 그대로(ROOMS/PLACES의 moveMin·durMin)
const AURA_MOVE = 16;
const footShop = { id: "airport-spa-foot", cat: "Massage", moveMin: 13, durMin: 60 };
const wonbo = { id: "chinatown-dimsum", cat: "Food", moveMin: 40, durMin: 45 };
const places = [
  { id: "sky72-outlet", cat: "Shopping", moveMin: 14, durMin: 60 },
  { id: "olive-young-kbeauty", cat: "Shopping", moveMin: 17, durMin: 30 },
  { id: "shinsegae-dutyfree", cat: "Shopping", moveMin: 13, durMin: 30 },
  wonbo,
  { id: "sinpo-market", cat: "Food", moveMin: 42, durMin: 30 },
  { id: "yeongjong-noodles", cat: "Food", moveMin: 16, durMin: 45 },
];

describe("courseUsedMin — 준비 시간 제외(A5)", () => {
  it("#1 숙소만: 16 + 16 = 32", () => {
    expect(courseUsedMin(AURA_MOVE, [])).toBe(32);
  });
  it("#2 숙소 + 더풋샵: 16 + (13+60) + 13 = 102", () => {
    expect(courseUsedMin(AURA_MOVE, [footShop])).toBe(102);
  });
  it("#3 숙소 + 원보만두 + 더풋샵: 187 (복귀는 마지막 장소 moveMin 재사용)", () => {
    expect(courseUsedMin(AURA_MOVE, [wonbo, footShop])).toBe(187);
  });
  it("#4 숙소·장소 없음: 0", () => {
    expect(courseUsedMin(null, [])).toBe(0);
  });
});

describe("courseAvailableMin(A5)", () => {
  it("#10 외출 가능 3h01m(181) → 코스 가용 2h41m(161)", () => {
    expect(courseAvailableMin(181)).toBe(161);
  });
  it("외출 불가(0) → 0", () => {
    expect(courseAvailableMin(0)).toBe(0);
  });
});

describe("scheduleSummary — 사용 X / 가용 Y (b)", () => {
  it("#11 외출 가능 181, 숙소 + 더풋샵 → 사용 122(이동·체류 102 + 준비 20) / 가용 181, 여유 59", () => {
    expect(scheduleSummary(181, courseUsedMin(AURA_MOVE, [footShop]))).toEqual({
      usedMin: 122,
      availableMin: 181,
      remainMin: 59,
    });
  });
  it("여유는 코스 가용 − 코스 사용과 같다", () => {
    const s = scheduleSummary(181, courseUsedMin(AURA_MOVE, [wonbo, footShop]));
    expect(s.remainMin).toBe(courseAvailableMin(181) - courseUsedMin(AURA_MOVE, [wonbo, footShop]));
    expect(s.remainMin).toBe(-26);
  });
  it("외출 불가(0) → 가용 0, 숙소만이어도 초과", () => {
    expect(scheduleSummary(0, courseUsedMin(AURA_MOVE, []))).toEqual({ usedMin: 52, availableMin: 0, remainMin: -52 });
  });
});

describe("wouldFit", () => {
  it("코스 가용 161에서 원보만두+더풋샵(187)은 26분 초과", () => {
    expect(wouldFit(161, AURA_MOVE, [wonbo], footShop)).toBe(false);
    expect(wouldFit(161, AURA_MOVE, [], footShop)).toBe(true);
  });
  it("이미 담긴 장소는 현재 일정으로 판단", () => {
    expect(wouldFit(102, AURA_MOVE, [footShop], footShop)).toBe(true);
  });
});

describe("buildCourseTimeline", () => {
  it("#5 공항 밖 10:30, 숙소 16분, 더풋샵 — 시각은 기존과 동일", () => {
    const t = buildCourseTimeline(630, AURA_MOVE, [footShop]);
    expect(t.checkInAt).toBe(666);
    expect(t.stops).toEqual([{ arriveAt: 679, leaveAt: 739 }]);
    expect(t.returnAt).toBe(752);
    expect(t.usedMin).toBe(102);
    expect(t.usedMin).toBe(courseUsedMin(AURA_MOVE, [footShop]));
  });
});

describe("autoBuild — 기존 동작(탐욕법)", () => {
  it("#6 코스 가용 161, 관심사 [Shopping, Rest], 선택 [Food, Shopping] → 다이소, 7곡제면소", () => {
    const r = autoBuild({
      selected: ["Food", "Shopping"],
      interests: ["Shopping", "Rest"],
      places,
      roomMoveMin: AURA_MOVE,
      availableMin: 161,
    });
    expect(r.map((p) => p.id)).toEqual(["shinsegae-dutyfree", "yeongjong-noodles"]);
    expect(courseUsedMin(AURA_MOVE, r)).toBe(136);
  });
  it("#7 코스 가용 80 → 다이소만", () => {
    const r = autoBuild({
      selected: ["Food", "Shopping"],
      interests: ["Shopping", "Rest"],
      places,
      roomMoveMin: AURA_MOVE,
      availableMin: 80,
    });
    expect(r.map((p) => p.id)).toEqual(["shinsegae-dutyfree"]);
  });
  it("선택 카테고리가 없으면 ACT_KEYS 전체", () => {
    const r = autoBuild({ selected: [], interests: [], places, roomMoveMin: AURA_MOVE, availableMin: 1000 });
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

// 2026-10-16 레거시 화면(app/index.html)을 모의 API(자동차 1km당 2분, 대중교통 1km당 3분)로 실제 조작해 읽은 값.
// 옮긴 레거시 함수가 이 관측값과 같아야 이식이 맞다 — docs/results/2026-10-16-course-map-compare.md
describe("레거시 화면 관측값 = 레거시 함수(이식 확인)", () => {
  // 레거시 화면의 "총 N분"은 준비 20분 포함 → courseUsedMin(준비 제외) + COURSE_PREP_MIN과 비교
  const total = (roomMoveMin: number, stops: { moveMin: number; durMin: number }[]) =>
    courseUsedMin(roomMoveMin, stops) + 20;
  const ROOM = 6; // 공항→호텔 오라
  const himart = { id: "sky72-outlet", cat: "Shopping", moveMin: 23, durMin: 60 };
  const olive = { id: "olive-young-kbeauty", cat: "Shopping", moveMin: 24, durMin: 30 };
  const daiso = { id: "shinsegae-dutyfree", cat: "Shopping", moveMin: 24, durMin: 30 };

  it("장소 0개: 총 0시간 32분, 체크인 10:56, 복귀 11:02", () => {
    expect(total(ROOM, [])).toBe(32);
    const tl = buildCourseTimeline(630, ROOM, []);
    expect([tl.checkInAt, tl.returnAt]).toEqual([656, 662]);
  });
  it("하이마트 1곳: 총 2시간 12분, 도착 11:19, 복귀 12:42", () => {
    expect(total(ROOM, [himart])).toBe(132);
    const tl = buildCourseTimeline(630, ROOM, [himart]);
    expect([tl.stops[0]!.arriveAt, tl.returnAt]).toEqual([679, 762]);
  });
  it("3곳: 총 4시간 1분, 올리브영 12:43·다이소 13:37 도착, 복귀 14:31", () => {
    expect(total(ROOM, [himart, olive, daiso])).toBe(241);
    const tl = buildCourseTimeline(630, ROOM, [himart, olive, daiso]);
    expect([tl.stops[1]!.arriveAt, tl.stops[2]!.arriveAt, tl.returnAt]).toEqual([763, 817, 871]);
  });
  it("자동 추천(관심사 쇼핑): 올리브영 1곳, 총 1시간 44분 — 레거시 예산 140·181·430 모두 같은 결과", () => {
    for (const budget of [140, 181, 430]) {
      // 레거시 BUDGET(준비 포함) → 코스 가용 시간(A5) = BUDGET − 20
      const r = autoBuild({
        selected: ["Shopping"],
        interests: ["Shopping", "Rest"],
        places: [himart, olive, daiso],
        roomMoveMin: ROOM,
        availableMin: budget - 20,
      });
      expect(r.map((p) => p.id)).toEqual(["olive-young-kbeauty"]);
      expect(total(ROOM, r)).toBe(104);
    }
  });
});
