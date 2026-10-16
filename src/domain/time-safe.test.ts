// 기댓값은 docs/formulas/time-safe.md "예시" 표와 같은 숫자다. 표를 바꾸면 여기도 같이 바꾼다.
import { describe, expect, it } from "vitest";
import {
  averageSecurityWaitMin,
  computeTimeSafe,
  effectiveArrival,
  effectiveDeparture,
  flightDelayMin,
  isLiveSecurityApplied,
  liveSecurityTerminal,
  resolveConnection,
  securityBufferMin,
} from "./time-safe";
import { dayOffset, diffFlightMin, hhmm, parseFlightDateTime } from "./time";

const base = { departureTerminal: null, liveSecurityWaitMin: null };

describe("computeTimeSafe — 외출 가능 시간 (기본 버퍼 50/50/30)", () => {
  it("#1 10:30 도착 → 14:51 출발(4h21m): 공항 밖 11:20, 복귀 13:31 → 2h11m", () => {
    const r = computeTimeSafe({ ...base, arriveMin: 630, departMin: 891 });
    expect(r.totalConnectionMin).toBe(261);
    expect(r.arrivalImmigrationMin).toBe(50);
    expect(r.securityMin).toBe(50);
    expect(r.gateMarginMin).toBe(30);
    expect(r.exitAtMin).toBe(680);
    expect(r.returnBufferMin).toBe(80);
    expect(r.canGoOut).toBe(true);
    expect(r.returnByMin).toBe(811);
    expect(hhmm(r.returnByMin)).toBe("13:31");
    expect(r.outingMin).toBe(131);
  });

  it("#2 남는 시간이 정확히 MIN_STAY(60분)면 외출 가능", () => {
    const r = computeTimeSafe({ ...base, arriveMin: 600, departMin: 790 });
    expect(r.canGoOut).toBe(true);
    expect(r.returnByMin).toBe(710);
    expect(r.outingMin).toBe(60);
  });

  it("#3 59분 남으면 외출 불가 → 복귀 = 공항 밖 시각, 외출 가능 0", () => {
    const r = computeTimeSafe({ ...base, arriveMin: 600, departMin: 789 });
    expect(r.canGoOut).toBe(false);
    expect(r.returnByMin).toBe(650);
    expect(r.outingMin).toBe(0);
  });

  it("#4 연결편 없음 → 복귀 = 도착 + LAYOVER_BUDGET(360), 외출 가능 360 − 50", () => {
    const r = computeTimeSafe({ ...base, arriveMin: 630, departMin: null });
    expect(r.canGoOut).toBe(true);
    expect(r.returnByMin).toBe(990);
    expect(r.outingMin).toBe(310);
    expect(r.totalConnectionMin).toBeNull();
  });

  it("#5 T1 실시간 대기 12분 → 하한 50분 유지, #1과 같은 2h11m (A3)", () => {
    const r = computeTimeSafe({ arriveMin: 630, departMin: 891, departureTerminal: "P01", liveSecurityWaitMin: 12 });
    expect(r.securityMin).toBe(50);
    expect(r.returnBufferMin).toBe(80);
    expect(r.returnByMin).toBe(811);
    expect(r.outingMin).toBe(131);
  });

  it("#12 T1 실시간 대기 65분 → 65분 사용, 복귀 버퍼 95분, 1h56m (A3)", () => {
    const r = computeTimeSafe({ arriveMin: 630, departMin: 891, departureTerminal: "P01", liveSecurityWaitMin: 65 });
    expect(r.securityMin).toBe(65);
    expect(r.returnBufferMin).toBe(95);
    expect(r.returnByMin).toBe(796);
    expect(r.outingMin).toBe(116);
  });
});

describe("computeTimeSafe — 버퍼 조합 비교(A1)", () => {
  it("#13 기획서·지원서 예시식(입국심사 50 + 게이트 30, 보안검색 0) → 3h01m", () => {
    const r = computeTimeSafe(
      { ...base, arriveMin: 630, departMin: 891 },
      { arrivalImmigrationMin: 50, departureSecurityMin: 0, gateMarginMin: 30 },
    );
    expect(r.exitAtMin).toBe(680);
    expect(r.returnByMin).toBe(861);
    expect(r.outingMin).toBe(181);
  });

  it("#14 레거시 코드 버퍼(입국심사 0 + 보안검색 50 + 게이트 30) → 3h01m", () => {
    const r = computeTimeSafe(
      { ...base, arriveMin: 630, departMin: 891 },
      { arrivalImmigrationMin: 0, departureSecurityMin: 50, gateMarginMin: 30 },
    );
    expect(r.exitAtMin).toBe(630);
    expect(r.returnByMin).toBe(811);
    expect(r.outingMin).toBe(181);
  });

  it("실시간 대기 하한은 departureSecurityMin을 따른다", () => {
    expect(securityBufferMin("P01", 40, 30)).toBe(40);
    expect(isLiveSecurityApplied("P01", 40, 30)).toBe(true);
  });
});

describe("resolveConnection — 자정 넘김(A2)", () => {
  it("#6 22:00 도착 → 01:30 출발(날짜 없음): 출발을 익일로 → 외출 가능 1h20m", () => {
    const c = resolveConnection({ scheduleDateTime: "2200" }, { scheduleDateTime: "0130" })!;
    expect(c).toEqual({ arriveMin: 1320, departMin: 1530, departNextDay: true, warning: null });
    const r = computeTimeSafe({ ...base, arriveMin: c.arriveMin, departMin: c.departMin });
    expect(r.totalConnectionMin).toBe(210);
    expect(r.canGoOut).toBe(true);
    expect(r.returnByMin).toBe(1450);
    expect(hhmm(r.returnByMin)).toBe("00:10");
    expect(dayOffset(r.returnByMin)).toBe(1);
    expect(r.outingMin).toBe(80);
  });

  it("#9 날짜 있음: 2026-10-16 22:00 → 2026-10-17 01:30 = #6과 동일", () => {
    const c = resolveConnection({ scheduleDateTime: "202610162200" }, { scheduleDateTime: "202610170130" })!;
    expect(c).toEqual({ arriveMin: 1320, departMin: 1530, departNextDay: true, warning: null });
  });

  it("#10 날짜 있음: 이틀 뒤 01:30 출발 → 27h30m, OVER_24H 경고", () => {
    const c = resolveConnection({ scheduleDateTime: "202610162200" }, { scheduleDateTime: "202610180130" })!;
    expect(c.departMin).toBe(2970);
    expect(c.warning).toBe("OVER_24H");
  });

  it("#11 날짜 있음: 출발이 도착보다 앞섬 → DEPART_BEFORE_ARRIVAL, 외출 불가", () => {
    const c = resolveConnection({ scheduleDateTime: "202610162200" }, { scheduleDateTime: "202610162100" })!;
    expect(c.departMin).toBe(1260);
    expect(c.warning).toBe("DEPART_BEFORE_ARRIVAL");
    expect(computeTimeSafe({ ...base, arriveMin: c.arriveMin, departMin: c.departMin }).canGoOut).toBe(false);
  });

  it("같은 날(날짜 없음)은 그대로", () => {
    const c = resolveConnection({ scheduleDateTime: "1030" }, { scheduleDateTime: "1451" })!;
    expect(c).toEqual({ arriveMin: 630, departMin: 891, departNextDay: false, warning: null });
  });

  it("한쪽만 날짜가 있으면 날짜 없는 규칙", () => {
    const c = resolveConnection({ scheduleDateTime: "202610162200" }, { scheduleDateTime: "0130" })!;
    expect(c.departMin).toBe(1530);
  });

  it("연결편 없음 / 파싱 실패", () => {
    expect(resolveConnection({ scheduleDateTime: "1030" }, null)!.departMin).toBeNull();
    expect(resolveConnection({ scheduleDateTime: "1030" }, { scheduleDateTime: "" })!.departMin).toBeNull();
    expect(resolveConnection({ scheduleDateTime: "" }, null)).toBeNull();
  });
});

describe("securityBufferMin — max(기준값, 실시간) (A3)", () => {
  it.each([
    ["P01", 12, 50, false],
    ["P01", 50, 50, false],
    ["P01", 65, 65, true],
    ["P01", null, 50, false],
    ["P03", 65, 65, true],
    ["P03", 20, 50, false],
    ["P02", 65, 65, true],
    [null, 65, 50, false],
  ] as const)("터미널 %s, 실시간 %s → %s분 (실시간 반영 %s)", (terminal, live, expected, applied) => {
    expect(securityBufferMin(terminal, live)).toBe(expected);
    expect(isLiveSecurityApplied(terminal, live)).toBe(applied);
  });
});

describe("liveSecurityTerminal — 실시간 대기 제공 터미널", () => {
  it.each([
    ["P01", "T1"],
    ["P03", "T2"],
    ["P02", "T1"],
    ["P04", null],
    [null, null],
  ] as const)("%s → %s", (terminal, expected) => {
    expect(liveSecurityTerminal(terminal)).toBe(expected);
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

describe("항공편 시각 선택", () => {
  it("도착: 실시간 예상 우선, 없으면 예정", () => {
    expect(effectiveArrival({ scheduleDateTime: "1030", estimatedDateTime: "1035" })?.min).toBe(635);
    expect(effectiveArrival({ scheduleDateTime: "1030", estimatedDateTime: null })?.min).toBe(630);
    expect(effectiveArrival({ scheduleDateTime: "", estimatedDateTime: "" })).toBeNull();
  });
  it("#7 출발: 예상이 예정보다 이르면 예정으로 올림", () => {
    expect(effectiveDeparture({ scheduleDateTime: "1450", estimatedDateTime: "1440" })?.min).toBe(890);
    expect(effectiveDeparture({ scheduleDateTime: "1450", estimatedDateTime: "1510" })?.min).toBe(910);
    expect(effectiveDeparture({ scheduleDateTime: "1450" })?.min).toBe(890);
  });
  it("#8 출발: 예정 23:50 → 예상 00:10은 20분 지연으로 본다(A2)", () => {
    expect(effectiveDeparture({ scheduleDateTime: "2350", estimatedDateTime: "0010" })?.min).toBe(10);
    expect(flightDelayMin({ scheduleDateTime: "2350", estimatedDateTime: "0010" })).toBe(20);
    expect(effectiveDeparture({ scheduleDateTime: "202610162350", estimatedDateTime: "202610170010" })).toEqual({
      day: 20743,
      min: 10,
    });
    const c = resolveConnection({ scheduleDateTime: "2000" }, { scheduleDateTime: "2350", estimatedDateTime: "0010" })!;
    expect(c.departMin).toBe(1450);
  });
  it("지연(분)", () => {
    expect(flightDelayMin({ scheduleDateTime: "1450", estimatedDateTime: "1510" })).toBe(20);
    expect(flightDelayMin({ scheduleDateTime: "1450", estimatedDateTime: "1440" })).toBe(0);
  });
});

describe("time 유틸", () => {
  it("parseFlightDateTime", () => {
    expect(parseFlightDateTime("2005")).toEqual({ day: null, min: 1205 });
    expect(parseFlightDateTime("0004")).toEqual({ day: null, min: 4 });
    expect(parseFlightDateTime("930")).toEqual({ day: null, min: 570 });
    expect(parseFlightDateTime("202610162005")).toEqual({ day: 20742, min: 1205 });
    expect(parseFlightDateTime("12")).toBeNull();
    expect(parseFlightDateTime(null)).toBeNull();
    expect(parseFlightDateTime("2460")).toBeNull();
    expect(parseFlightDateTime("202602302005")).toBeNull();
  });
  it("diffFlightMin: 날짜 없으면 12시간 이내 최근접", () => {
    expect(diffFlightMin({ day: null, min: 10 }, { day: null, min: 1430 })).toBe(20);
    expect(diffFlightMin({ day: null, min: 1430 }, { day: null, min: 10 })).toBe(-20);
    expect(diffFlightMin({ day: 2, min: 10 }, { day: 1, min: 1430 })).toBe(20);
  });
  it("hhmm / dayOffset", () => {
    expect(hhmm(1450)).toBe("00:10");
    expect(dayOffset(1450)).toBe(1);
    expect(hhmm(-30)).toBe("23:30");
    expect(dayOffset(811)).toBe(0);
  });
});
