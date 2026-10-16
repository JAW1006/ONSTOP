// @vitest-environment jsdom
// 기댓값은 docs/formulas/time-safe.md 예시(#1, #3, #12)와 같은 숫자
import { act, cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { renderApp } from "@/test/render-app";

type Flight = Record<string, string | null>;
let arrivals: Record<string, Flight>;
let departures: Record<string, Flight>;
let securityGates: { waitTimeMin: number }[];
let securityGatesT2: { waitTimeMin: number }[];

const fetchMock = vi.fn(async (url: string) => {
  const u = new URL(url, "http://localhost");
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
  const id = u.searchParams.get("flightId") ?? "";
  if (u.pathname === "/api/flight/arrival") return arrivals[id] ? json(200, { flights: [arrivals[id]] }) : json(404, {});
  if (u.pathname === "/api/flight/departure") return departures[id] ? json(200, { flights: [departures[id]] }) : json(404, {});
  if (u.pathname === "/api/security-wait") return json(200, { gates: securityGates });
  if (u.pathname === "/api/security-wait/t2") return json(200, { gates: securityGatesT2 });
  return json(500, {});
});

beforeEach(async () => {
  arrivals = {
    KE085: { flightId: "KE085", airline: "Korean Air", fromAirport: "Los Angeles", scheduleDateTime: "1030", estimatedDateTime: "1030", terminal: "P03", gate: "230", remark: null },
    LATE1: { flightId: "LATE1", airline: "Late Air", fromAirport: "Manila", scheduleDateTime: "1015", estimatedDateTime: "1030", terminal: "P01", gate: "12", remark: null },
  };
  departures = {
    MU2043: { flightId: "MU2043", airline: "China Eastern", toAirport: "Qingdao", scheduleDateTime: "1451", estimatedDateTime: "1451", terminal: "P02", gate: "129", remark: null },
    SOON1: { flightId: "SOON1", airline: "Soon Air", toAirport: "Osaka", scheduleDateTime: "1250", estimatedDateTime: null, terminal: "P02", gate: "1", remark: null },
    T2DEP: { flightId: "T2DEP", airline: "T2 Air", toAirport: "Tokyo", scheduleDateTime: "1451", estimatedDateTime: null, terminal: "P03", gate: "250", remark: null },
    T1DEP: { flightId: "T1DEP", airline: "T1 Air", toAirport: "Hanoi", scheduleDateTime: "1451", estimatedDateTime: null, terminal: "P01", gate: "40", remark: null },
  };
  securityGates = [{ waitTimeMin: 20 }, { waitTimeMin: 30 }]; // 평균 25 < 기준 50
  securityGatesT2 = [{ waitTimeMin: 70 }];
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockClear();
  await i18n.changeLanguage("en");
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const home = (arrivalFlightId = "KE085", departureFlightId = "MU2043") =>
  renderApp("/", { onboarded: true, arrivalFlightId, departureFlightId });
const card = () => screen.getByRole("heading", { name: /^Time-Safe · / }).closest("[data-slot=card]") as HTMLElement;

describe("홈 — Time-Safe 카드", () => {
  it("#1 외출 가능 2h 11m, 도착·복귀, 버퍼 예상 줄, 실시간 배지", async () => {
    home();
    await waitFor(() => expect(card().textContent).toContain("2h 11m"));
    const c = card();
    expect(within(c).getByRole("heading").textContent).toBe("Time-Safe · KE085");
    expect(c.textContent).toContain("Korean Air KE085 · Est. arrival 10:30");
    expect(c.textContent).toContain("China Eastern MU2043 · Scheduled departure 14:51");
    expect(c.textContent).toContain("Total connection time 4h 21m");
    expect(c.textContent).toContain("Recommended return 13:31");
    expect(c.textContent).toContain("Estimated times applied: immigration ~50 min");
    expect(within(c).getByText("Live")).toBeTruthy();
    // MU2043은 탑승동(P02) — T1 출국장 대기를 쓴다(평균 25분 < 50 → 기준값)
    await waitFor(() => expect(card().textContent).toContain("Live security wait checked (T1) · now ~25 min"));
    expect(fetchMock).toHaveBeenCalledWith("/api/security-wait");
    expect(fetchMock).not.toHaveBeenCalledWith("/api/security-wait/t2");
  });

  it("지연 배지: 예정 10:15 → 예상 10:30 = 15분 지연", async () => {
    home("LATE1");
    await waitFor(() => expect(card().textContent).toContain("15 min delayed"));
  });

  it("#12 T1 연결편, 실시간 65분 > 50 → 1h 56m + T1 실시간 배지", async () => {
    securityGates = [{ waitTimeMin: 60 }, { waitTimeMin: 70 }];
    home("KE085", "T1DEP");
    await waitFor(() => expect(card().textContent).toContain("1h 56m"));
    expect(card().textContent).toContain("Live security wait checked (T1) · now ~65 min");
    expect(fetchMock).toHaveBeenCalledWith("/api/security-wait");
  });

  it("T2 연결편, 실시간 70분 → /api/security-wait/t2, 1h 51m + T2 실시간 배지", async () => {
    home("KE085", "T2DEP");
    await waitFor(() => expect(card().textContent).toContain("1h 51m"));
    expect(card().textContent).toContain("Live security wait checked (T2) · now ~70 min");
    expect(fetchMock).toHaveBeenCalledWith("/api/security-wait/t2");
    expect(fetchMock).not.toHaveBeenCalledWith("/api/security-wait");
  });

  it("T2 실시간 조회 실패 → 기준값, '실시간 아님' 배지", async () => {
    securityGatesT2 = [];
    home("KE085", "T2DEP");
    await waitFor(() => expect(card().textContent).toContain("2h 11m"));
    expect(card().textContent).toContain("No live security data · using estimate");
  });

  it("T1 실시간 20분 < 50 → 기준값 50 유지(A3), 배지는 실제 대기 20분 표시", async () => {
    securityGates = [{ waitTimeMin: 20 }];
    home("KE085", "T1DEP");
    await waitFor(() => expect(card().textContent).toContain("Live security wait checked (T1) · now ~20 min"));
    expect(card().textContent).toContain("2h 11m");
    expect(card().textContent).toContain("security & exit check ~50 min");
  });

  it("#3 외출 불가 → 경고 박스, Time-Fit 카드 비활성·더보기 없음", async () => {
    home("KE085", "SOON1");
    await waitFor(() => expect(card().textContent).toContain("You can't leave the airport"));
    const timeFit = screen.getByRole("button", { name: /You can't leave the airport/ }) as HTMLButtonElement;
    expect(timeFit.disabled).toBe(true);
    expect(screen.getAllByRole("button", { name: /More/ })).toHaveLength(1); // 데이유즈 더보기만
  });

  it("항공편 변경 < → 온보딩 step 2", async () => {
    const { router } = home();
    await waitFor(() => expect(card().textContent).toContain("2h 11m"));
    await act(async () => fireEvent.click(screen.getByRole("link", { name: "Enter a different flight" })));
    expect(router.state.location.pathname + router.state.location.search).toBe("/onboarding?step=2");
  });
});

describe("홈 — 재조회와 변경 배너", () => {
  it("새로고침으로 연결편이 30분 지연되면 '복귀 추천 13:31 → 14:01' 배너, 닫기", async () => {
    home();
    await waitFor(() => expect(card().textContent).toContain("2h 11m"));
    // 출국장 대기 조회가 끝나야 새로고침 버튼이 풀린다
    await waitFor(() => expect(card().textContent).toContain("now ~25 min"));
    expect(screen.queryByRole("status")).toBeNull();

    departures.MU2043 = { ...departures.MU2043!, estimatedDateTime: "1521" };
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Refresh flight status" })));
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Connecting flight time changed · return by 13:31 → 14:01"));
    expect(card().textContent).toContain("2h 41m");
    expect(card().textContent).toContain("30 min delayed");

    fireEvent.click(within(screen.getByRole("status")).getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("도착만 바뀌면 도착 변경 배너", async () => {
    home();
    await waitFor(() => expect(card().textContent).toContain("2h 11m"));
    // 출국장 대기 조회가 끝나야 새로고침 버튼이 풀린다
    await waitFor(() => expect(card().textContent).toContain("now ~25 min"));
    arrivals.KE085 = { ...arrivals.KE085!, estimatedDateTime: "1050" };
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Refresh flight status" })));
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Arrival time changed · 10:30 → 10:50"));
  });

  it("값이 그대로면 배너 없음", async () => {
    home();
    await waitFor(() => expect(card().textContent).toContain("2h 11m"));
    // 출국장 대기 조회가 끝나야 새로고침 버튼이 풀린다
    await waitFor(() => expect(card().textContent).toContain("now ~25 min"));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Refresh flight status" })));
    await waitFor(() => expect((screen.getByRole("button", { name: "Refresh flight status" }) as HTMLButtonElement).disabled).toBe(false));
    expect(screen.queryByRole("status")).toBeNull();
  });
});

describe("홈 — 데이유즈·핫플레이스·짐 케어", () => {
  it("숙소 10개, 첫 카드 → /booking/hotel-aura-incheon", async () => {
    const { router } = home();
    const list = screen.getByRole("list", { name: "Day-Use · Time Block Booking" });
    expect(within(list).getAllByRole("link")).toHaveLength(10);
    expect(within(list).getAllByRole("link")[0]!.textContent).toContain("Hotel Aura Incheon Airport");
    expect(within(list).getAllByRole("link")[0]!.textContent).toContain("₩50,000~");
    expect(within(list).getAllByRole("link")[0]!.textContent).toContain("3–9 hrs");
    await act(async () => fireEvent.click(within(list).getAllByRole("link")[0]!));
    expect(router.state.location.pathname).toBe("/booking/hotel-aura-incheon");
  });

  it("핫플레이스 6개, 원보만두 → 시트(이동 40분·체류 45분·₩12,000~)", async () => {
    await i18n.changeLanguage("ko");
    home();
    const list = screen.getByRole("list", { name: "핫플레이스" });
    expect(within(list).getAllByRole("button")).toHaveLength(6);
    await act(async () => fireEvent.click(within(list).getByRole("button", { name: /원보만두/ })));
    const sheet = screen.getByRole("dialog", { name: "원보만두" });
    expect(sheet.textContent).toContain("이동 40분");
    expect(sheet.textContent).toContain("체류 45분");
    expect(sheet.textContent).toContain("₩12,000~");
  });

  it("짐 케어 배너 → /luggage", async () => {
    const { router } = home();
    await act(async () => fireEvent.click(screen.getByRole("link", { name: /Luggage Care/ })));
    expect(router.state.location.pathname).toBe("/luggage");
  });
});
