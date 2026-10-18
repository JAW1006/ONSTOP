// @vitest-environment jsdom
// 화면 기댓값은 docs/formulas/time-safe.md 예시와 같은 숫자(기본 버퍼 50/50/30)
import { act, cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { renderApp } from "@/test/render-app";

type Flight = Record<string, string | null>;
const ARRIVALS: Record<string, Flight> = {
  KE085: {
    flightId: "KE085",
    airline: "Korean Air",
    fromAirport: "Los Angeles",
    scheduleDateTime: "1030",
    estimatedDateTime: "1030",
    terminal: "P03",
    gate: "230",
    remark: null,
  },
  NIGHT1: {
    flightId: "NIGHT1",
    airline: "Night Air",
    fromAirport: "Bangkok",
    scheduleDateTime: "2200",
    estimatedDateTime: null,
    terminal: "P01",
    gate: "12",
    remark: null,
  },
};
const DEPARTURES: Record<string, Flight> = {
  MU2043: {
    flightId: "MU2043",
    airline: "China Eastern",
    toAirport: "Qingdao",
    scheduleDateTime: "1451",
    estimatedDateTime: "1451",
    terminal: "P02",
    gate: "129",
    remark: null,
  },
  NIGHT2: {
    flightId: "NIGHT2",
    airline: "Night Air",
    toAirport: "Tokyo",
    scheduleDateTime: "0130",
    estimatedDateTime: null,
    terminal: "P02",
    gate: "20",
    remark: null,
  },
  SOON1: {
    flightId: "SOON1",
    airline: "Soon Air",
    toAirport: "Osaka",
    scheduleDateTime: "1250",
    estimatedDateTime: null,
    terminal: "P02",
    gate: "1",
    remark: null,
  },
  T1DEP: {
    flightId: "T1DEP",
    airline: "T1 Air",
    toAirport: "Hanoi",
    scheduleDateTime: "1451",
    estimatedDateTime: null,
    terminal: "P01",
    gate: "40",
    remark: null,
  },
};

// 기본 T1 출국장 평균 25분(< 기준 50분) — 65분이 필요한 테스트에서만 바꾼다
let securityGates = [{ waitTimeMin: 20 }, { waitTimeMin: 30 }];

const fetchMock = vi.fn(async (url: string) => {
  const u = new URL(url, "http://localhost");
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
  const id = u.searchParams.get("flightId") ?? "";
  if (u.pathname === "/api/flight/arrival")
    return ARRIVALS[id] ? json(200, { flights: [ARRIVALS[id]] }) : json(404, { error: `no arrival found for "${id}"` });
  if (u.pathname === "/api/flight/departure")
    return DEPARTURES[id] ? json(200, { flights: [DEPARTURES[id]] }) : json(404, { error: "x" });
  if (u.pathname === "/api/security-wait") return json(200, { gates: securityGates });
  return json(500, { error: "unexpected" });
});

beforeEach(async () => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockClear();
  securityGates = [{ waitTimeMin: 20 }, { waitTimeMin: 30 }];
  await i18n.changeLanguage("en");
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function lookUp(label: string, flightId: string) {
  const input = screen.getByLabelText(label);
  fireEvent.change(input, { target: { value: flightId.toLowerCase() } });
  const button = input.parentElement!.querySelector("button")!;
  await act(async () => fireEvent.click(button));
}
const ARR = "The flight you just arrived on";
const DEP = "Your next connecting flight";
const card = () => screen.getByRole("region", { name: "TIME-SAFE RESULT" });
const cta = () => screen.getByRole("button", { name: /Get smart course picks/ }) as HTMLButtonElement;

describe("온보딩 단계", () => {
  it("언어 선택 → 문구가 바뀌고, 관심사 → 항공편 단계로 간다", async () => {
    renderApp("/onboarding");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: /한국어/ })));
    expect(screen.getByRole("heading", { name: "언어를 선택해주세요" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(screen.getByRole("heading", { name: "관심 있는 활동을 골라주세요" })).toBeTruthy();
    // 기본 관심사(쇼핑·휴식) 선택됨, 토글 가능
    expect(screen.getByRole("button", { name: "쇼핑" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "맛집" }));
    expect(screen.getByRole("button", { name: "맛집" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(screen.getByRole("heading", { name: "환승 항공편을 입력해주세요" })).toBeTruthy();
  });
});

describe("항공편 조회 + Time-Safe", () => {
  it("#1 10:30 도착 → 14:51 출발: 외출 가능 2h 11m, 복귀 13:31, CTA로 홈 이동", async () => {
    const { router } = renderApp("/onboarding?step=2");
    expect(cta().disabled).toBe(true);
    await lookUp(ARR, "KE085");
    await waitFor(() => expect(card().textContent).toContain("Korean Air KE085"));
    expect(card().textContent).toContain("Look up your connecting flight");
    expect(fetchMock).toHaveBeenCalledWith("/api/flight/arrival?flightId=KE085&lang=E");

    await lookUp(DEP, "MU2043");
    await waitFor(() => expect(card().textContent).toContain("2h 11m"));
    expect(card().textContent).toContain("Total connection time 4h 21m");
    expect(card().textContent).toContain("Return by 13:31");
    expect(card().textContent).toContain(
      "Estimated times applied: immigration ~50 min · security & exit check ~50 min · gate margin ~30 min",
    );
    expect(cta().disabled).toBe(false);

    await act(async () => fireEvent.click(cta()));
    expect(router.state.location.pathname).toBe("/");
    expect(screen.getByRole("heading", { name: /Hello, Traveler/ })).toBeTruthy();
  });

  it("#6 22:00 도착 → 01:30 출발: 익일 출발, 외출 가능 1h 20m", async () => {
    renderApp("/onboarding?step=2");
    await lookUp(ARR, "NIGHT1");
    await lookUp(DEP, "NIGHT2");
    await waitFor(() => expect(card().textContent).toContain("1h 20m"));
    expect(card().textContent).toContain("Departs Next day 01:30");
    expect(card().textContent).toContain("Total connection time 3h 30m");
    expect(card().textContent).toContain("Return by Next day 00:10");
  });

  it("#3 남는 시간 부족(12:50 출발) → 외출 불가, CTA 비활성 + 이유 문구(레거시와 다름)", async () => {
    renderApp("/onboarding?step=2");
    await lookUp(ARR, "KE085");
    await lookUp(DEP, "SOON1");
    await waitFor(() => expect(card().textContent).toContain("You can't leave the airport"));
    expect(cta().disabled).toBe(true);
    expect(screen.getByText(/There is no time to leave the airport, so we can't suggest a course/)).toBeTruthy();
  });

  it("#12 연결편 T1 → 출국장 실시간 평균 65분 반영, 1h 56m", async () => {
    securityGates = [{ waitTimeMin: 60 }, { waitTimeMin: 70 }];
    renderApp("/onboarding?step=2");
    await lookUp(ARR, "KE085");
    await lookUp(DEP, "T1DEP");
    await waitFor(() => expect(card().textContent).toContain("1h 56m"));
    expect(fetchMock).toHaveBeenCalledWith("/api/security-wait");
    expect(card().textContent).toContain("security & exit check ~65 min");
  });

  it("탑승동(P02) 연결편 → T1 출국장 대기 조회(평균 25분 < 50 → 기준값, 2h 11m)", async () => {
    renderApp("/onboarding?step=2");
    await lookUp(ARR, "KE085");
    await lookUp(DEP, "MU2043");
    await waitFor(() => expect(card().textContent).toContain("2h 11m"));
    expect(fetchMock).toHaveBeenCalledWith("/api/security-wait");
  });

  it("404 → '일치하는 항공편 없음' 번역 문구", async () => {
    renderApp("/onboarding?step=2");
    await lookUp(ARR, "XX999");
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toBe(
        "No matching flight found · Please check the flight number and look up again.",
      ),
    );
    expect(cta().disabled).toBe(true);
  });

  it("편명은 대문자로 바뀌고, 빈 칸이면 조회 버튼 비활성", () => {
    renderApp("/onboarding?step=2");
    const input = screen.getByLabelText(ARR) as HTMLInputElement;
    expect((input.parentElement!.querySelector("button") as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(input, { target: { value: "ke085" } });
    expect(input.value).toBe("KE085");
  });
});
