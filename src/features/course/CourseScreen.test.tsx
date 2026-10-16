// @vitest-environment jsdom
// 지도는 모의(FakeMapView). API 모의 규칙: 자동차 = 1km당 2분·거리 ×1.3, 대중교통 = 1km당 3분·거리 ×1.4·버스1+지하철1·1,500원.
// 공항 밖 11:20, 외출 가능 2h11m(131), 코스 가용 111, 복귀 목표 13:31 — time-safe.md #1과 같은 항공편.
import { act, cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { fakeMap } from "@/test/fake-map";
import { renderApp } from "@/test/render-app";

const R = 6371;
const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};

let routeFails = false;
const departures: Record<string, object> = {
  MU2043: { flightId: "MU2043", airline: "China Eastern", toAirport: "Qingdao", scheduleDateTime: "1451", estimatedDateTime: "1451", terminal: "P02", gate: "129", remark: null },
  SOON1: { flightId: "SOON1", airline: "Soon Air", toAirport: "Osaka", scheduleDateTime: "1250", estimatedDateTime: null, terminal: "P02", gate: "1", remark: null },
};
const fetchMock = vi.fn(async (url: string) => {
  const u = new URL(url, "http://localhost");
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
  const p = u.searchParams;
  const leg = () => km({ lat: +p.get("originLat")!, lng: +p.get("originLng")! }, { lat: +p.get("destLat")!, lng: +p.get("destLng")! });
  switch (u.pathname) {
    case "/api/flight/arrival":
      return json(200, { flights: [{ flightId: "KE085", airline: "Korean Air", fromAirport: "Los Angeles", scheduleDateTime: "1030", estimatedDateTime: "1030", terminal: "P01", gate: "230", remark: null }] });
    case "/api/flight/departure":
      return json(200, { flights: [departures[p.get("flightId")!]] });
    case "/api/security-wait":
      return json(200, { gates: [{ waitTimeMin: 25 }] });
    case "/api/route":
      return routeFails ? json(502, { error: "down" }) : json(200, { durationSec: Math.round(leg() * 120), distanceM: Math.round(leg() * 1300), path: null });
    case "/api/transit":
      return json(200, { durationMin: Math.round(leg() * 3), fare: 1500, path: null, distanceM: Math.round(leg() * 1400), busTransitCount: 1, subwayTransitCount: 1 });
    case "/api/places":
    case "/api/places/search":
      return json(200, { places: [] });
  }
  return json(500, {});
});

beforeEach(async () => {
  routeFails = false;
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockClear();
  await i18n.changeLanguage("en");
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const open = (opts: { departure?: string; room?: string } = {}) =>
  renderApp("/course", { onboarded: true, arrivalFlightId: "KE085", departureFlightId: opts.departure ?? "MU2043", courseRoomId: opts.room });
const panel = () => screen.getByRole("region", { name: "My course" });
const legs = () => within(screen.getByRole("list", { name: "map legs" })).queryAllByRole("button");
const places = () => screen.getByRole("region", { name: "Activity spots" });
const placeCard = (re: RegExp) => within(places()).getByText(re).closest("[data-slot=card]") as HTMLElement;
const rooms = () => screen.getByRole("list", { name: "① Choose your day-use stay" });
const addButton = (name: string) => within(places()).getByRole("button", { name: `Add to plan · ${name}` });
const waitReady = () => waitFor(() => expect(panel().textContent).toContain("/ available 2h 11m"));

describe("코스 지도 — 숙소만", () => {
  it("헤더(편명·T1), 숙소 핀 선택 → 공항→호텔·복귀 구간, 사용 0h 32m / 가용 2h 11m, 여유 99, 숙소 출발 13:25까지", async () => {
    open();
    await waitReady();
    expect(screen.getByText("KE085 · Incheon T1")).toBeTruthy();
    expect(legs()).toHaveLength(0);
    expect(panel().textContent).toContain("Pick a stay to calculate travel time");

    await act(async () => fireEvent.click(within(rooms()).getByRole("button", { name: /Hotel Aura Incheon Airport/ })));
    await waitFor(() => expect(legs().map((b) => b.textContent)).toEqual(["6 min 4.1 km", "Return 6 min 4.1 km"]));
    expect(fakeMap.scene!.pins.find((p) => p.id === "room:hotel-aura-incheon")!.kind).toBe("hotel");
    expect(legs()[1]!.dataset.return).toBe("true");
    const text = panel().textContent!;
    expect(text).toContain("Used 0h 32m");
    expect(text).toContain("99 min to spare");
    expect(text).toContain("Prep 20 min");
    expect(text).toContain("Travel 12 min");
    expect(text).toContain("Target airport arrival13:31");
    expect(text).toContain("Leave your stay by13:25");
  });
});

describe("코스 지도 — 장소 추가/제거 시 즉시 갱신", () => {
  it("롯데하이마트 추가: 대중교통 23분·10.9km, 사용 2h 8m, 여유 3, 마지막 장소 출발 13:12까지 → 올리브영 추가: 29분 초과, 늦음 경고", async () => {
    open({ room: "hotel-aura-incheon" });
    await waitReady();
    await waitFor(() => expect(placeCard(/Lotte Hi-Mart/).textContent).toContain("23 min transfer"));

    await act(async () => fireEvent.click(addButton("Lotte Hi-Mart (Yeongjong)")));
    await waitFor(() => expect(legs().map((b) => b.textContent)).toEqual(["6 min 4.1 km", "23 min 10.9 km", "Return 19 min 8.7 km"]));
    expect(fakeMap.scene!.pins.find((p) => p.kind === "place")).toMatchObject({ number: 1, label: "Lotte Hi-Mart (Yeongjong)" });
    let text = panel().textContent!;
    expect(text).toContain("Used 2h 8m");
    expect(text).toContain("3 min to spare");
    expect(text).toContain("Leave your last stop by13:12");

    await act(async () => fireEvent.click(addButton("Olive Young (Unseo)")));
    await waitFor(() => expect(panel().textContent).toContain("29 min over"));
    text = panel().textContent!;
    expect(text).toContain("Over 29 min");
    expect(within(panel()).getByRole("alert").textContent).toContain("Remove a spot or shorten your stays");
    expect(text).toContain("Expected airport arrival14:00 (later than target 13:31)");
    // 도보 구간(하이마트→올리브영 0.13km)은 근사·거리 없음
    expect(legs()[2]!.textContent).toBe("~2 min");
    expect(legs()[2]!.dataset.mode).toBe("walk");

    // 타임라인에서 제거하면 다시 여유
    // 일정의 두 번째 장소(올리브영) 삭제
    await act(async () => fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[1]!));
    await waitFor(() => expect(panel().textContent).toContain("3 min to spare"));
  });
});

describe("코스 지도 — 구간 선택·근사값", () => {
  it("칩을 누르면 그 구간만 선택(지도 장면) + 수단·거리·환승·요금 표시, 다시 누르면 해제", async () => {
    open({ room: "hotel-aura-incheon" });
    await waitReady();
    await act(async () => fireEvent.click(addButton("Lotte Hi-Mart (Yeongjong)")));
    await waitFor(() => expect(legs()).toHaveLength(3));
    await waitFor(() => expect(legs()[1]!.textContent).toBe("23 min 10.9 km"));
    await act(async () => fireEvent.click(legs()[1]!));
    expect(fakeMap.scene!.selectedLeg).toBe(1);
    expect(screen.getByRole("status").textContent).toBe("Transit · 23 min · 10.9 km · 1 transfer(s) · ₩1,500");
    await act(async () => fireEvent.click(legs()[1]!));
    expect(fakeMap.scene!.selectedLeg).toBeNull();
  });

  it("자동차 경로 조회가 실패하면 '약 N분'(~6 min), 거리 없이 시간만", async () => {
    routeFails = true;
    open({ room: "hotel-aura-incheon" });
    await waitReady();
    await waitFor(() => expect(legs().map((b) => b.textContent)).toEqual(["~6 min", "Return ~6 min"]));
  });
});

describe("코스 지도 — 자동 추천·저장", () => {
  it("관심사 쇼핑 → 올리브영 1곳(정렬은 숙소→장소+체류), 저장하면 저장된 코스로, 코스 탭도 저장 화면으로", async () => {
    const { router } = open({ room: "hotel-aura-incheon" });
    await waitReady();
    await waitFor(() => expect(placeCard(/Olive Young/).textContent).toContain("24 min transfer"));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: /Auto-build with Time-Fit/ })));
    await waitFor(() => expect(fakeMap.scene!.pins.filter((p) => p.kind === "place").map((p) => p.label)).toEqual(["Olive Young (Unseo)"]));
    await waitFor(() => expect(panel().textContent).toContain("32 min to spare"));

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Save course" })));
    expect(router.state.location.pathname).toBe("/course/saved");
    await waitFor(() => expect(screen.getByRole("heading", { name: "Saved Course" })).toBeTruthy());
    expect(within(screen.getByRole("navigation")).getAllByRole("link")[2]!.getAttribute("href")).toBe("/course/saved");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Edit" })));
    expect(router.state.location.pathname).toBe("/course");
  });
});

describe("코스 지도 — 외출 불가·색 규칙", () => {
  it("외출 불가면 이유 표시, 숙소 선택·자동 추천 막힘", async () => {
    open({ departure: "SOON1" });
    await waitFor(() => expect(screen.getAllByRole("alert")[0]!.textContent).toContain("You can't leave the airport"));
    expect((within(rooms()).getByRole("button", { name: /Hotel Aura Incheon Airport/ }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: /Auto-build with Time-Fit/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("코스 화면 카테고리 배지는 회색(neutral) + 아이콘·글자, 시간 막대 구간은 역할 색", async () => {
    open({ room: "hotel-aura-incheon" });
    await waitReady();
    const badge = within(placeCard(/Lotte Hi-Mart/)).getByText("Shopping");
    expect(badge.className).toContain("bg-muted");
    expect(badge.querySelector("svg")).toBeTruthy();
    const segs = [...panel().querySelectorAll("[data-segment]")].map((e) => [e.getAttribute("data-segment"), e.className]);
    expect(segs).toEqual([
      ["prep", "bg-role-prep"],
      ["travel", "bg-role-route"],
      ["spare", "bg-role-spare"],
    ]);
  });
});
