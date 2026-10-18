// @vitest-environment jsdom
// 빌더 = 보수적 근사만(경로 API 호출 0회), 저장된 코스 = 실제 경로 조회(2026-10-16 결정).
// 경로 = 공항 → 호텔 → 장소들 → 호텔(짐 찾기) → 공항(B1, 2026-10-16 결정).
// 지도는 모의(FakeMapView). API 모의 규칙: 자동차 = 1km당 2분·거리 ×1.3, 대중교통 = 1km당 3분·거리 ×1.4·버스1+지하철1·1,500원.
// 공항 밖 11:20, 외출 가능 2h11m(131), 코스 가용 111, 복귀 목표 13:31 — time-safe.md #1과 같은 항공편.
import { act, cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { fakeMap } from "@/test/fake-map";
import { PLACES } from "@/data";
import { renderApp } from "@/test/render-app";

const R = 6371;
const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};

let routeFails = false;
const departures: Record<string, object> = {
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
  // 13:40 출발 → 외출 가능 정확히 60분(MIN_STAY), 코스 가용 40분
  TIGHT1: {
    flightId: "TIGHT1",
    airline: "Tight Air",
    toAirport: "Busan",
    scheduleDateTime: "1340",
    estimatedDateTime: null,
    terminal: "P02",
    gate: "2",
    remark: null,
  },
  // 19:00 출발 → 외출 가능 6h20m(380), 코스 가용 360
  LONG1: {
    flightId: "LONG1",
    airline: "Long Air",
    toAirport: "Tokyo",
    scheduleDateTime: "1900",
    estimatedDateTime: null,
    terminal: "P02",
    gate: "3",
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
};
const fetchMock = vi.fn(async (url: string) => {
  const u = new URL(url, "http://localhost");
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
  const p = u.searchParams;
  const leg = () =>
    km({ lat: +p.get("originLat")!, lng: +p.get("originLng")! }, { lat: +p.get("destLat")!, lng: +p.get("destLng")! });
  switch (u.pathname) {
    case "/api/flight/arrival":
      return json(200, {
        flights: [
          {
            flightId: "KE085",
            airline: "Korean Air",
            fromAirport: "Los Angeles",
            scheduleDateTime: "1030",
            estimatedDateTime: "1030",
            terminal: "P01",
            gate: "230",
            remark: null,
          },
        ],
      });
    case "/api/flight/departure":
      return json(200, { flights: [departures[p.get("flightId")!]] });
    case "/api/security-wait":
      return json(200, { gates: [{ waitTimeMin: 25 }] });
    case "/api/route":
      return routeFails
        ? json(502, { error: "down" })
        : json(200, { durationSec: Math.round(leg() * 120), distanceM: Math.round(leg() * 1300), path: null });
    case "/api/transit":
      return json(200, {
        durationMin: Math.round(leg() * 3),
        fare: 1500,
        path: null,
        distanceM: Math.round(leg() * 1400),
        busTransitCount: 1,
        subwayTransitCount: 1,
      });
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
  renderApp("/course", {
    onboarded: true,
    arrivalFlightId: "KE085",
    departureFlightId: opts.departure ?? "MU2043",
    courseRoomId: opts.room,
  });
const panel = () => screen.getByRole("region", { name: "My course" });
const legs = () => within(screen.getByRole("list", { name: "map legs" })).queryAllByRole("button");
const places = () => screen.getByRole("region", { name: "Activity spots" });
const placeCard = (re: RegExp) => within(places()).getByText(re).closest("[data-slot=card]") as HTMLElement;
const rooms = () => screen.getByRole("list", { name: "① Choose your day-use stay" });
const addButton = (name: string) => within(places()).getByRole("button", { name: `Add to plan · ${name}` });
const waitReady = () => waitFor(() => expect(panel().textContent).toContain("/ available 2h 11m"));

const routeCalls = () =>
  fetchMock.mock.calls
    .map(([u]) => String(u))
    .filter((u) => u.startsWith("/api/route") || u.startsWith("/api/transit"));
const openSaved = (planIds: string[]) =>
  renderApp("/course/saved", {
    onboarded: true,
    arrivalFlightId: "KE085",
    departureFlightId: "MU2043",
    savedCourse: {
      roomId: "hotel-aura-incheon",
      plan: planIds.map((id) => PLACES.find((p) => p.id === id)!),
      cats: ["Shopping"],
    },
  });

describe("코스 빌더 — 보수적 근사만(실제 경로 조회 안 함)", () => {
  it("숙소 선택: 공항↔호텔 약 19분(실측 6분보다 넉넉), 사용 0h 58m / 가용 2h 11m, 여유 73, 경로 API 호출 0회", async () => {
    open();
    await waitReady();
    expect(screen.getByText("KE085 · Incheon T1")).toBeTruthy();
    expect(legs()).toHaveLength(0);
    expect(panel().textContent).toContain("Pick a stay to calculate travel time");

    await act(async () => fireEvent.click(within(rooms()).getByRole("button", { name: /Hotel Aura Incheon Airport/ })));
    await waitFor(() => expect(legs().map((b) => b.textContent)).toEqual(["~19 min", "Return ~19 min"]));
    expect(fakeMap.scene!.pins.find((p) => p.id === "room:hotel-aura-incheon")!.kind).toBe("hotel");
    expect(legs()[1]!.dataset.return).toBe("true");
    const text = panel().textContent!;
    expect(text).toContain("Used 0h 58m");
    expect(text).toContain("73 min to spare");
    expect(text).toContain("Travel 38 min");
    expect(text).toContain("Target airport arrival13:31");
    expect(text).toContain("Leave your stay by13:12");
    expect(screen.getByText(/generous estimates/)).toBeTruthy();
    expect(routeCalls()).toEqual([]);
  });

  it("하이마트 추가: 약 47분·숙소로 약 47분·복귀 약 19분 → 81분 초과·복귀 예상 14:52(늦음), 올리브영 추가 → 113분 초과, 후보 목록도 근사, 호출 0회", async () => {
    open({ room: "hotel-aura-incheon" });
    await waitReady();
    expect(placeCard(/Lotte Hi-Mart/).textContent).toContain("~47 min");

    await act(async () => fireEvent.click(addButton("Lotte Hi-Mart (Yeongjong)")));
    await waitFor(() =>
      expect(legs().map((b) => b.textContent)).toEqual(["~19 min", "~47 min", "To stay ~47 min", "Return ~19 min"]),
    );
    expect(fakeMap.scene!.pins.find((p) => p.kind === "place")).toMatchObject({
      number: 1,
      label: "Lotte Hi-Mart (Yeongjong)",
    });
    let text = panel().textContent!;
    expect(text).toContain("Used 3h 32m");
    expect(text).toContain("81 min over");
    expect(text).toContain("Expected airport arrival14:52 (later than target 13:31)");
    expect(legs()[2]!.dataset.return).toBe("false");
    expect(legs()[3]!.dataset.return).toBe("true");

    await act(async () => fireEvent.click(addButton("Olive Young (Unseo)")));
    await waitFor(() => expect(panel().textContent).toContain("113 min over"));
    text = panel().textContent!;
    expect(within(panel()).getByRole("alert").textContent).toContain("Remove a spot or shorten your stays");
    expect(legs()[2]!.textContent).toBe("~2 min");
    expect(legs()[2]!.dataset.mode).toBe("walk");

    // 일정의 두 번째 장소(올리브영) 삭제 → 다시 81분 초과
    await act(async () => fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[1]!));
    await waitFor(() => expect(panel().textContent).toContain("81 min over"));
    expect(routeCalls()).toEqual([]);
  });

  it("자동 추천(충분한 연결편 19:00): 근사로 판정해 올리브영 1곳, 사용 3h 2m / 가용 6h 20m, 마지막 장소 16:34·숙소 17:21까지 출발", async () => {
    open({ departure: "LONG1", room: "hotel-aura-incheon" });
    await waitFor(() => expect(panel().textContent).toContain("/ available 6h 20m"));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: /Auto-build with Time-Fit/ })));
    await waitFor(() =>
      expect(fakeMap.scene!.pins.filter((p) => p.kind === "place").map((p) => p.label)).toEqual([
        "Olive Young (Unseo)",
      ]),
    );
    expect(panel().textContent).toContain("Used 3h 2m");
    expect(panel().textContent).toContain("198 min to spare");
    expect(panel().textContent).toContain("Leave your last stop by16:34");
    expect(panel().textContent).toContain("Leave your stay by17:21");
    expect(screen.getByText(/Back to Hotel Aura Incheon Airport · pick up luggage/)).toBeTruthy();
    expect(routeCalls()).toEqual([]);
  });
});

describe("저장된 코스 — 확정 후 실제 경로 조회", () => {
  it("하이마트: 실제 6분·23분·숙소로 23분·복귀 6분 → 사용 2h 18m, 7분 초과(호텔 복귀 전에는 여유 3)", async () => {
    openSaved(["sky72-outlet"]);
    await waitFor(() =>
      expect(legs().map((b) => b.textContent)).toEqual([
        "6 min 4.1 km",
        "23 min 10.9 km",
        "To stay 23 min 10.9 km",
        "Return 6 min 4.1 km",
      ]),
    );
    const text = panel().textContent!;
    expect(text).toContain("Used 2h 18m");
    expect(text).toContain("7 min over");
    expect(text).toContain("Expected airport arrival13:38 (later than target 13:31)");
    expect(routeCalls()).toHaveLength(4);
  });

  it("칩을 누르면 그 구간만 선택 + 수단·거리·환승·요금, 다시 누르면 해제", async () => {
    openSaved(["sky72-outlet"]);
    await waitFor(() => expect(legs()[1]!.textContent).toBe("23 min 10.9 km"));
    await act(async () => fireEvent.click(legs()[1]!));
    expect(fakeMap.scene!.selectedLeg).toBe(1);
    expect(screen.getByRole("status").textContent).toBe("Transit · 23 min · 10.9 km · 1 transfer(s) · ₩1,500");
    await act(async () => fireEvent.click(legs()[1]!));
    expect(fakeMap.scene!.selectedLeg).toBeNull();
  });

  it("자동차 경로 조회가 실패하면 근사값(~19 min), 거리 없이 시간만", async () => {
    routeFails = true;
    openSaved([]);
    await waitFor(() => expect(legs().map((b) => b.textContent)).toEqual(["~19 min", "Return ~19 min"]));
  });

  it("빌더에서 저장하면 저장된 코스로, 코스 탭도 저장 화면, 수정하기로 빌더 복귀", async () => {
    const { router } = open({ departure: "LONG1", room: "hotel-aura-incheon" });
    await waitFor(() => expect(panel().textContent).toContain("/ available 6h 20m"));
    await act(async () => fireEvent.click(addButton("Olive Young (Unseo)")));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Save course" })));
    expect(router.state.location.pathname).toBe("/course/saved");
    await waitFor(() => expect(screen.getByRole("heading", { name: "Saved Course" })).toBeTruthy());
    expect(within(screen.getByRole("navigation")).getAllByRole("link")[2]!.getAttribute("href")).toBe("/course/saved");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Edit" })));
    expect(router.state.location.pathname).toBe("/course");
  });
});

describe("코스 지도 — 자동 추천 0곳", () => {
  it("코스 가용 111분: 근사로는 어떤 쇼핑 장소도 안 들어감 → 안내 문구, 장소를 담으면 사라짐", async () => {
    open({ room: "hotel-aura-incheon" });
    await waitReady();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: /Auto-build with Time-Fit/ })));
    await waitFor(() => expect(screen.getByText(/No spot fits in the time left/)).toBeTruthy());
    expect(fakeMap.scene!.pins.filter((p) => p.kind === "place")).toHaveLength(0);
    await act(async () => fireEvent.click(addButton("Olive Young (Unseo)")));
    await waitFor(() => expect(screen.queryByText(/No spot fits in the time left/)).toBeNull());
  });
});

describe("코스 지도 — 외출 불가·색 규칙", () => {
  it("외출 불가면 이유 표시, 숙소 선택·자동 추천 막힘", async () => {
    open({ departure: "SOON1" });
    await waitFor(() => expect(screen.getAllByRole("alert")[0]!.textContent).toContain("You can't leave the airport"));
    expect(
      (within(rooms()).getByRole("button", { name: /Hotel Aura Incheon Airport/ }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect((screen.getByRole("button", { name: /Auto-build with Time-Fit/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("코스 화면 카테고리 배지는 회색(neutral) + 아이콘·글자, 시간 막대 구간은 역할 색", async () => {
    open({ room: "hotel-aura-incheon" });
    await waitReady();
    const badge = within(placeCard(/Lotte Hi-Mart/)).getByText("Shopping");
    expect(badge.className).toContain("bg-muted");
    expect(badge.querySelector("svg")).toBeTruthy();
    const segs = [...panel().querySelectorAll("[data-segment]")].map((e) => [
      e.getAttribute("data-segment"),
      e.className,
    ]);
    expect(segs).toEqual([
      ["prep", "bg-role-prep"],
      ["travel", "bg-role-route"],
      ["spare", "bg-role-spare"],
    ]);
  });
});
