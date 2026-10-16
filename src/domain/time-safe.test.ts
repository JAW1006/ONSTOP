// 기댓값은 docs/formulas/time-safe.md "예시" 표와 같은 숫자다. 표를 바꾸면 여기도 같이 바꾼다.
import { describe, expect, it } from "vitest";
import {
  averageSecurityWaitMin,
  computeTimeSafe,
  effectiveArrivalMin,
  effectiveDepartureMin,
  flightDelayMin,
  securityBufferMin,
} from "./time-safe";
import { dayOffset, hhmm, parseHHMM } from "./time";

const base = { departureTerminal: null, liveSecurityWaitMin: null };

describe("computeTimeSafe — 기존 동작", () => {
  it("#1 사용자 예시: 10:30 도착 → 14:51 출발(4h21m) = 3h01m", () => {
    const r = computeTimeSafe({ ...base, arriveMin: 630, departMin: 891 });
    expect(r.totalConnectionMin).toBe(261);
    expect(r.bufferMin).toBe(80);
    expect(r.canGoOut).toBe(true);
    expect(r.returnByMin).toBe(811);
    expect(hhmm(r.returnByMin)).toBe("13:31");
    expect(r.stayMin).toBe(181);
  });

  it("#2 남는 시간이 정확히 MIN_STAY(60분)면 외출 가능", () => {
    const r = computeTimeSafe({ ...base, arriveMin: 600, departMin: 740 });
    expect(r.canGoOut).toBe(true);
    expect(r.returnByMin).toBe(660);
    expect(r.stayMin).toBe(60);
  });

  it("#3 59분 남으면 외출 불가 → 복귀 시각 = 도착, 체류 0", () => {
    const r = computeTimeSafe({ ...base, arriveMin: 600, departMin: 739 });
    expect(r.canGoOut).toBe(false);
    expect(r.returnByMin).toBe(600);
    expect(r.stayMin).toBe(0);
  });

  it("#4 연결편 없음 → 도착 + LAYOVER_BUDGET(360)", () => {
    const r = computeTimeSafe({ ...base, arriveMin: 630, departMin: null });
    expect(r.canGoOut).toBe(true);
    expect(r.returnByMin).toBe(990);
    expect(r.stayMin).toBe(360);
    expect(r.totalConnectionMin).toBeNull();
  });

  it("#5 T1 실시간 대기 12분 → 50분을 대체, 버퍼 42분", () => {
    const r = computeTimeSafe({ arriveMin: 630, departMin: 891, departureTerminal: "P01", liveSecurityWaitMin: 12 });
    expect(r.securityMin).toBe(12);
    expect(r.bufferMin).toBe(42);
    expect(r.returnByMin).toBe(849);
    expect(r.stayMin).toBe(219);
  });

  it("#6 22:00 도착 → 01:30 출발: 자정 넘김 미처리로 외출 불가(A2 버그 고정)", () => {
    const r = computeTimeSafe({ ...base, arriveMin: 1320, departMin: 90 });
    expect(r.totalConnectionMin).toBe(-1230);
    expect(r.canGoOut).toBe(false);
    expect(r.stayMin).toBe(0);
  });
});

describe("securityBufferMin — 기존 동작", () => {
  it.each([
    ["P01", 12, 12],
    ["P01", null, 50],
    ["P03", 12, 50],
    [null, 12, 50],
  ] as const)("터미널 %s, 실시간 %s → %s분", (terminal, live, expected) => {
    expect(securityBufferMin(terminal, live)).toBe(expected);
  });
});

describe("averageSecurityWaitMin", () => {
  it("평균 반올림", () => {
    expect(averageSecurityWaitMin([{ waitTimeMin: 10 }, { waitTimeMin: 15 }, { waitTimeMin: 20 }])).toBe(15);
    expect(averageSecurityWaitMin([{ waitTimeMin: 10 }, { waitTimeMin: 11 }])).toBe(11);
  });
  it("게이트 없으면 null", () => {
    expect(averageSecurityWaitMin([])).toBeNull();
  });
});

describe("항공편 시각 선택 — 기존 동작", () => {
  it("도착: 실시간 예상 우선, 없으면 예정", () => {
    expect(effectiveArrivalMin({ scheduleDateTime: "1030", estimatedDateTime: "1035" })).toBe(635);
    expect(effectiveArrivalMin({ scheduleDateTime: "1030", estimatedDateTime: null })).toBe(630);
    expect(effectiveArrivalMin({ scheduleDateTime: "", estimatedDateTime: "" })).toBeNull();
  });
  it("출발: 예상이 예정보다 이르면 예정으로 올림", () => {
    expect(effectiveDepartureMin({ scheduleDateTime: "1450", estimatedDateTime: "1440" })).toBe(890);
    expect(effectiveDepartureMin({ scheduleDateTime: "1450", estimatedDateTime: "1510" })).toBe(910);
    expect(effectiveDepartureMin({ scheduleDateTime: "1450" })).toBe(890);
  });
  it("출발: 예정 23:50 → 예상 00:10(자정 넘긴 지연)은 예정으로 잘못 올림(A2 버그 고정)", () => {
    expect(effectiveDepartureMin({ scheduleDateTime: "2350", estimatedDateTime: "0010" })).toBe(1430);
  });
  it("지연(분)", () => {
    expect(flightDelayMin({ scheduleDateTime: "1450", estimatedDateTime: "1510" })).toBe(20);
    expect(flightDelayMin({ scheduleDateTime: "1450", estimatedDateTime: "1440" })).toBe(0);
  });
});

describe("time 유틸", () => {
  it("parseHHMM", () => {
    expect(parseHHMM("2005")).toBe(1205);
    expect(parseHHMM("0004")).toBe(4);
    expect(parseHHMM("930")).toBe(570);
    expect(parseHHMM("12")).toBeNull();
    expect(parseHHMM(null)).toBeNull();
  });
  it("hhmm / dayOffset", () => {
    expect(hhmm(1450)).toBe("00:10");
    expect(dayOffset(1450)).toBe(1);
    expect(hhmm(-30)).toBe("23:30");
    expect(dayOffset(811)).toBe(0);
  });
});
