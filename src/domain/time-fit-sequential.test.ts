// 기댓값은 docs/formulas/time-fit.md "순차 경로 예시"(S1–S6)와 같은 숫자다.
import { describe, expect, it } from "vitest";
import { courseAvailableMin, fitsSequential, returnPlan, scheduleSummary, sequentialCourse, sequentialUsedMin, autoBuildSequential, wouldFitSequential } from "./time-fit";
import { approxTravel } from "./travel";
import { hhmm } from "./time";

const START = 680; // 공항 밖 11:20
const OUTING = 131; // 외출 가능 2h11m
const RETURN_BY = 811; // 13:31

describe("sequentialCourse — 순차 경로(A6) + 호텔 복귀(B1)", () => {
  it("S1 장소 0개: 공항→호텔 18, 호텔→공항 18 (호텔 복귀 구간 없음)", () => {
    const c = sequentialCourse(START, [18, 18], []);
    expect(c.usedMin).toBe(36);
    expect(scheduleSummary(OUTING, c.usedMin)).toEqual({ usedMin: 56, availableMin: 131, remainMin: 75 });
    expect(hhmm(c.checkInAt)).toBe("11:58");
    expect(c.hotelReturnAt).toBe(c.checkInAt);
    expect(hhmm(c.returnAt)).toBe("12:16");
    const r = returnPlan(RETURN_BY, c);
    expect(hhmm(r.hotelDepartureDeadlineMin)).toBe("13:13");
    expect(hhmm(r.lastDepartureDeadlineMin)).toBe("13:13");
  });

  it("S2 A만: 18 + 12 + A→호텔 12 + 호텔→공항 18 + 체류 25 = 85", () => {
    const c = sequentialCourse(START, [18, 12, 12, 18], [25]);
    expect(c.usedMin).toBe(85);
    expect(scheduleSummary(OUTING, c.usedMin)).toEqual({ usedMin: 105, availableMin: 131, remainMin: 26 });
    expect(hhmm(c.hotelReturnAt)).toBe("12:47");
    expect(hhmm(c.returnAt)).toBe("13:05");
    expect(hhmm(returnPlan(RETURN_BY, c).lastDepartureDeadlineMin)).toBe("13:01");
  });

  it("S3 A→B: 사용 2h09m / 가용 2h11m, 여유 2 — 호텔 복귀 13:11, 마지막 장소 출발 기한 13:05", () => {
    const c = sequentialCourse(START, [18, 12, 8, 8, 18], [25, 20]);
    expect(c.travelMin).toBe(64);
    expect(c.stayMin).toBe(45);
    expect(scheduleSummary(OUTING, c.usedMin)).toEqual({ usedMin: 129, availableMin: 131, remainMin: 2 });
    expect(c.stops.map((s) => `${hhmm(s.arriveAt)}-${hhmm(s.leaveAt)}`)).toEqual(["12:10-12:35", "12:43-13:03"]);
    expect(hhmm(c.hotelReturnAt)).toBe("13:11");
    expect(hhmm(c.returnAt)).toBe("13:29");
    expect(returnPlan(RETURN_BY, c)).toEqual({
      targetMin: 811,
      hotelDepartureDeadlineMin: 793,
      lastDepartureDeadlineMin: 785,
      late: false,
      lateMin: 0,
      blockEndMin: null,
      blockOver: false,
      blockOverMin: 0,
    });
  });

  it("S4 A→B→C: 23분 초과, 호텔 복귀 13:36, 복귀 예상 13:54 > 목표 13:31", () => {
    const c = sequentialCourse(START, [18, 12, 8, 10, 20, 18], [25, 20, 3]);
    expect(c.usedMin).toBe(134);
    expect(scheduleSummary(OUTING, c.usedMin).remainMin).toBe(-23);
    expect(hhmm(c.hotelReturnAt)).toBe("13:36");
    expect(hhmm(c.returnAt)).toBe("13:54");
    expect(returnPlan(RETURN_BY, c)).toMatchObject({ late: true, lateMin: 23 });
  });

  it("S6 블록 제약: S3에서 블록 종료 13:00이면 11분 늦음, 마지막 장소 출발 기한 12:52 / 종료 15:00이면 문제 없음", () => {
    const c = sequentialCourse(START, [18, 12, 8, 8, 18], [25, 20]);
    expect(returnPlan(RETURN_BY, c, 780)).toMatchObject({ blockEndMin: 780, blockOver: true, blockOverMin: 11, lastDepartureDeadlineMin: 772 });
    expect(hhmm(772)).toBe("12:52");
    expect(returnPlan(RETURN_BY, c, 900)).toMatchObject({ blockOver: false, blockOverMin: 0, lastDepartureDeadlineMin: 785 });
    // 장소가 없으면 호텔 복귀 구간이 없어 블록 제약이 없다
    expect(returnPlan(RETURN_BY, sequentialCourse(START, [18, 18], []), 700).blockOver).toBe(false);
  });

  it("구간 수가 맞지 않으면 오류(장소 N개면 N + 3, 없으면 2)", () => {
    expect(() => sequentialCourse(START, [18], [])).toThrow();
    expect(() => sequentialCourse(START, [18, 12, 18], [25])).toThrow();
  });
});

describe("autoBuildSequential / wouldFitSequential — S5", () => {
  // 구간표(분). 장소→호텔은 호텔→장소와 같게 둔다. 없는 쌍은 테스트에서 쓰지 않는다
  const LEG: Record<string, number> = {
    "airport>hotel": 18, "hotel>airport": 18,
    "hotel>S1": 13, "S1>hotel": 13, "hotel>S2": 17, "S2>hotel": 17,
    "hotel>F1": 16, "F1>hotel": 16, "hotel>F2": 40, "F2>hotel": 40,
    "S1>F1": 5, "S1>F2": 30, "S2>F1": 6, "S2>F2": 31,
  };
  type P = { id: string; cat: string; dur: number; rankMove: number };
  const places: P[] = [
    { id: "S2", cat: "Shopping", dur: 30, rankMove: 17 },
    { id: "S1", cat: "Shopping", dur: 30, rankMove: 13 },
    { id: "F2", cat: "Food", dur: 45, rankMove: 40 },
    { id: "F1", cat: "Food", dur: 45, rankMove: 16 },
  ];
  const legsFor = (stops: readonly P[]) => {
    const ids = ["airport", "hotel", ...stops.map((s) => s.id), ...(stops.length ? ["hotel"] : []), "airport"];
    return ids.slice(1).map((to, i) => {
      const v = LEG[`${ids[i]}>${to}`];
      if (v == null) throw new Error(`no leg ${ids[i]}>${to}`);
      return v;
    });
  };
  const opts = { selected: ["Food", "Shopping"], interests: ["Shopping"], places, legsFor };
  const s1 = places.find((p) => p.id === "S1")!;
  const f1 = places.find((p) => p.id === "F1")!;

  it("가용 111(= 외출 131 − 준비 20) → 쇼핑 S1만 (S1 62+30 = 92, S1→F1 추가 시 145 초과)", () => {
    expect(courseAvailableMin(OUTING)).toBe(111);
    const r = autoBuildSequential({ ...opts, availableMin: 111 });
    expect(r.map((p) => p.id)).toEqual(["S1"]);
    expect(sequentialUsedMin(legsFor, r)).toBe(92);
  });

  it("가용 200 → S1, F1 (합계 145)", () => {
    const r = autoBuildSequential({ ...opts, availableMin: 200 });
    expect(r.map((p) => p.id)).toEqual(["S1", "F1"]);
    expect(sequentialUsedMin(legsFor, r)).toBe(145);
  });

  it("가용 200 + 블록 종료 13:40(820): S1→F1은 호텔 복귀 13:47이라 제외 → S1만(호텔 복귀 12:54)", () => {
    const block = { startMin: START, endMin: 820 };
    expect(autoBuildSequential({ ...opts, availableMin: 200, block }).map((p) => p.id)).toEqual(["S1"]);
    expect(hhmm(sequentialCourse(START, legsFor([s1, f1]), [30, 45]).hotelReturnAt)).toBe("13:47");
    expect(hhmm(sequentialCourse(START, legsFor([s1]), [30]).hotelReturnAt)).toBe("12:54");
  });

  it("환승 내 가능: 일정 [S1]에 F1을 끝에 붙이면 145", () => {
    expect(wouldFitSequential(144, legsFor, [s1], f1)).toBe(false);
    expect(wouldFitSequential(145, legsFor, [s1], f1)).toBe(true);
    expect(wouldFitSequential(92, legsFor, [s1], s1)).toBe(true);
    expect(wouldFitSequential(200, legsFor, [s1], f1, { startMin: START, endMin: 820 })).toBe(false);
    expect(fitsSequential(200, legsFor, [s1, f1], { startMin: START, endMin: 827 })).toBe(true);
  });
});

describe("approxTravel — 보수적 근사", () => {
  it("도보(≤1.2km)는 직선 × 1.3 ÷ 4.5km/h, 그 외는 직선 × 6분", () => {
    expect(approxTravel(0.9)).toEqual({ min: 16, mode: "walk", approx: true });
    expect(approxTravel(2.4)).toEqual({ min: 14, mode: "drive", approx: true });
    expect(approxTravel(12)).toEqual({ min: 72, mode: "transit", approx: true });
    // 실측보다 길어야 한다: 공항→호텔 오라 실측 16분(3.16km), 호텔 오라→차이나타운 실측 95분(17.9km)
    expect(approxTravel(3.16).min).toBeGreaterThanOrEqual(16);
    expect(approxTravel(17.9).min).toBeGreaterThanOrEqual(95);
  });
});
