// 기댓값은 docs/formulas/time-fit.md "순차 경로 예시"(S1–S5)와 같은 숫자다.
import { describe, expect, it } from "vitest";
import { courseAvailableMin, returnPlan, scheduleSummary, sequentialCourse, sequentialUsedMin, autoBuildSequential, wouldFitSequential } from "./time-fit";
import { approxTravel } from "./travel";
import { hhmm } from "./time";

const START = 680; // 공항 밖 11:20
const OUTING = 131; // 외출 가능 2h11m
const RETURN_BY = 811; // 13:31

describe("sequentialCourse — 순차 경로(A6)", () => {
  it("S1 장소 0개: 공항→호텔 18, 호텔→공항 18", () => {
    const c = sequentialCourse(START, [18, 18], []);
    expect(c.usedMin).toBe(36);
    expect(scheduleSummary(OUTING, c.usedMin)).toEqual({ usedMin: 56, availableMin: 131, remainMin: 75 });
    expect(hhmm(c.checkInAt)).toBe("11:58");
    expect(hhmm(c.returnAt)).toBe("12:16");
    expect(hhmm(returnPlan(RETURN_BY, c).lastDepartureDeadlineMin)).toBe("13:13");
  });

  it("S2 A만: 18 + 12 + A→공항 20 + 체류 25 = 75", () => {
    const c = sequentialCourse(START, [18, 12, 20], [25]);
    expect(c.usedMin).toBe(75);
    expect(scheduleSummary(OUTING, c.usedMin).remainMin).toBe(36);
  });

  it("S3 A→B: 사용 1h58m / 가용 2h11m, 여유 13, 마지막 출발 기한 13:16 (시안 v2와 같은 숫자)", () => {
    const c = sequentialCourse(START, [18, 12, 8, 15], [25, 20]);
    expect(c.travelMin).toBe(53);
    expect(c.stayMin).toBe(45);
    expect(scheduleSummary(OUTING, c.usedMin)).toEqual({ usedMin: 118, availableMin: 131, remainMin: 13 });
    expect(c.stops.map((s) => `${hhmm(s.arriveAt)}-${hhmm(s.leaveAt)}`)).toEqual(["12:10-12:35", "12:43-13:03"]);
    expect(hhmm(c.returnAt)).toBe("13:18");
    expect(returnPlan(RETURN_BY, c)).toEqual({ targetMin: 811, lastDepartureDeadlineMin: 796, late: false, lateMin: 0 });
    expect(hhmm(796)).toBe("13:16");
  });

  it("S4 A→B→C: 9분 초과, 복귀 예상 13:40 > 목표 13:31", () => {
    const c = sequentialCourse(START, [18, 12, 8, 10, 24], [25, 20, 3]);
    expect(c.usedMin).toBe(120);
    expect(scheduleSummary(OUTING, c.usedMin).remainMin).toBe(-9);
    expect(hhmm(c.returnAt)).toBe("13:40");
    expect(returnPlan(RETURN_BY, c)).toMatchObject({ late: true, lateMin: 9 });
  });

  it("구간 수가 맞지 않으면 오류", () => {
    expect(() => sequentialCourse(START, [18], [])).toThrow();
  });
});

describe("autoBuildSequential / wouldFitSequential — S5", () => {
  // 구간표(분). 없는 쌍은 테스트에서 쓰지 않는다
  const LEG: Record<string, number> = {
    "airport>hotel": 18, "hotel>airport": 18,
    "hotel>S1": 13, "S1>airport": 20, "hotel>S2": 17, "S2>airport": 22,
    "hotel>F1": 16, "F1>airport": 22, "hotel>F2": 40, "F2>airport": 45,
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
    const ids = ["airport", "hotel", ...stops.map((s) => s.id), "airport"];
    return ids.slice(1).map((to, i) => {
      const v = LEG[`${ids[i]}>${to}`];
      if (v == null) throw new Error(`no leg ${ids[i]}>${to}`);
      return v;
    });
  };
  const opts = { selected: ["Food", "Shopping"], interests: ["Shopping"], places, legsFor };

  it("가용 111(= 외출 131 − 준비 20) → 쇼핑 S1만 (S1 51+30 = 81, S1→F1 추가 시 133 초과)", () => {
    expect(courseAvailableMin(OUTING)).toBe(111);
    const r = autoBuildSequential({ ...opts, availableMin: 111 });
    expect(r.map((p) => p.id)).toEqual(["S1"]);
    expect(sequentialUsedMin(legsFor, r)).toBe(81);
  });

  it("가용 200 → S1, F1 (합계 133)", () => {
    const r = autoBuildSequential({ ...opts, availableMin: 200 });
    expect(r.map((p) => p.id)).toEqual(["S1", "F1"]);
    expect(sequentialUsedMin(legsFor, r)).toBe(133);
  });

  it("환승 내 가능: 일정 [S1]에 F1을 끝에 붙이면 133", () => {
    const s1 = places.find((p) => p.id === "S1")!;
    const f1 = places.find((p) => p.id === "F1")!;
    expect(wouldFitSequential(111, legsFor, [s1], f1)).toBe(false);
    expect(wouldFitSequential(133, legsFor, [s1], f1)).toBe(true);
    expect(wouldFitSequential(81, legsFor, [s1], s1)).toBe(true);
  });
});

describe("approxTravel — 근사 구간", () => {
  it("도보(≤1.2km)는 4.5km/h, 그 외는 km × 2분", () => {
    expect(approxTravel(0.9)).toEqual({ min: 12, mode: "walk", approx: true });
    expect(approxTravel(2.4)).toEqual({ min: 5, mode: "drive", approx: true });
    expect(approxTravel(12)).toEqual({ min: 24, mode: "transit", approx: true });
  });
});
