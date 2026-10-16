// @vitest-environment jsdom
// 예약 요청 화면 — docs/design/screens/booking.md. 가격표·참여 상태는 이 테스트 안에서만 쓰는 가상의 값이다(실제 데이터 아님).
// 항공편: 도착 KE085 10:30(T1) → 공항 밖 11:20, 출발 MU2043 14:51 → 복귀 목표 13:31(코스 테스트와 같은 항공편).
// 모의 경로 API(저장된 코스): 자동차 = 1km당 2분, 대중교통 = 1km당 3분 — CourseScreen.test.tsx와 같은 규칙.
import { act, cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { PLACES } from "@/data";
import type { BookingRequest } from "./requests";
import { renderApp } from "@/test/render-app";

vi.mock("@/data/demo-offers.json", () => ({
  default: {
    offers: {
      "hotel-aura-incheon": {
        products: [
          { hours: 6, price: 80000, vatIncluded: true },
          { hours: 1, price: 20000, vatIncluded: true },
          { hours: 3, price: 50000, vatIncluded: true },
          { hours: 4, price: 58000, vatIncluded: false, startWindow: { from: "12:00", to: "14:00" } },
        ],
        includes: ["shower", "luggage"],
        source: { date: "2026-10-16", method: "demo", by: "test" },
      },
    },
  },
}));
vi.mock("@/data/hotel-partners.json", () => ({
  default: {
    "hotel-aura-incheon": { participation: "confirmed", contact: { email: "frontdesk@example.test" } },
    "western-grace-hotel": { participation: "negotiating" },
  },
}));

const R = 6371;
const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
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
      return json(200, { flights: [{ flightId: "MU2043", airline: "China Eastern", toAirport: "Qingdao", scheduleDateTime: "1451", estimatedDateTime: "1451", terminal: "P02", gate: "129", remark: null }] });
    case "/api/security-wait":
      return json(200, { gates: [{ waitTimeMin: 25 }] });
    case "/api/route":
      return json(200, { durationSec: Math.round(leg() * 120), distanceM: Math.round(leg() * 1300), path: null });
    case "/api/transit":
      return json(200, { durationMin: Math.round(leg() * 3), fare: 1500, path: null, distanceM: Math.round(leg() * 1400), busTransitCount: 1, subwayTransitCount: 1 });
    case "/api/places":
    case "/api/places/search":
      return json(200, { places: [] });
  }
  return json(500, {});
});

beforeEach(async () => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockClear();
  await i18n.changeLanguage("en");
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const base = { onboarded: true, arrivalFlightId: "KE085", departureFlightId: "MU2043" };
const open = (roomId: string, opts: Partial<Parameters<typeof renderApp>[1]> = {}) => renderApp(`/booking/${roomId}`, { ...base, ...opts });
const timing = () => screen.getByRole("region", { name: "Time check" });
const submitButton = (name = "Send booking request") => screen.getByRole("button", { name }) as HTMLButtonElement;
const slot = (time: string) => within(screen.getByRole("region", { name: "Choose check-in time" })).getByRole("button", { name: time });
const product = (re: RegExp) => within(screen.getByRole("region", { name: "Choose a time block" })).getByRole("button", { name: re }) as HTMLButtonElement;
const fillContact = async () => {
  await act(async () => {
    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "KIM MINJI" } });
    fireEvent.change(screen.getByLabelText(/^Email$/), { target: { value: "minji@example.test" } });
    fireEvent.change(screen.getByLabelText(/^Confirm email/), { target: { value: "minji@example.test" } });
  });
  for (const box of within(screen.getByRole("group", { name: "Consent" })).getAllByRole("checkbox")) await act(async () => fireEvent.click(box));
};
const withSaved = (roomId: string, ids: string[]) => ({
  savedCourse: { roomId, plan: ids.map((id) => PLACES.find((p) => p.id === id)!), cats: ["Shopping"] },
});
const request = (over: Partial<BookingRequest>): BookingRequest => ({
  id: "DEMO-000001",
  roomId: "hotel-aura-incheon",
  mode: "product",
  checkInMin: 720,
  endMin: 900,
  hours: 3,
  price: 50000,
  priceSource: "demo",
  planIds: [],
  name: "KIM MINJI",
  email: "minji@example.test",
  lang: "en",
  status: "requested",
  createdAt: 0,
  ...over,
});

describe("예약 요청 — 상품 요청(가격표 있음), 코스 없이 진입(B2)", () => {
  it("슬롯 12:00부터, 가격표 그대로(데모값), 기본 상품 1h(13:31 전까지 들어가는 가장 긴 것), 공항 복귀 12:19", async () => {
    open("hotel-aura-incheon");
    await waitFor(() => expect(timing().textContent).toContain("Target airport arrival13:31"));
    expect(timing().textContent).toContain("Expected airport arrival12:19");
    expect(screen.getByRole("note").textContent).toBe("Demo — requests are not sent to hotels");
    expect(screen.getByText("~19 min from airport · Shower · Storage", { exact: false })).toBeTruthy();
    expect(within(screen.getByRole("region", { name: "Choose a time block" })).getByText("Demo")).toBeTruthy();
    expect(within(screen.getByRole("region", { name: "Choose a time block" })).getAllByRole("button").map((b) => b.textContent!.split("₩")[0])).toEqual(["1h", "3h", "4h", "6h"]);
    expect(product(/^1h/).getAttribute("aria-pressed")).toBe("true");
    expect(timing().textContent).toContain("Day-use ends13:00");
    expect(timing().textContent).not.toContain("Back at stay");
    expect(screen.getByText(/Build a course to also check/)).toBeTruthy();
    expect(screen.getByText(/TimeStay doesn't check whether you can enter Korea/)).toBeTruthy();
  });

  it("시작 가능 시각: 14:30이면 4h(12:00–14:00 시작) 비활성", async () => {
    open("hotel-aura-incheon");
    await waitFor(() => expect(slot("14:30")).toBeTruthy());
    expect(product(/^4h/).disabled).toBe(false);
    await act(async () => fireEvent.click(slot("14:30")));
    expect(product(/^4h/).disabled).toBe(true);
    expect(product(/^4h/).textContent).toContain("Start 12:00–14:00 only");
  });

  it("연락처·동의 전에는 비활성, 채우면 요청 → 내 예약(요청됨) → 요청 취소 → 취소됨", async () => {
    const { router } = open("hotel-aura-incheon");
    await waitFor(() => expect(timing()).toBeTruthy());
    expect(submitButton().disabled).toBe(true);
    await act(async () => fireEvent.change(screen.getByLabelText(/^Confirm email/), { target: { value: "other@example.test" } }));
    await fillContact();
    await act(async () => fireEvent.change(screen.getByLabelText(/^Confirm email/), { target: { value: "other@example.test" } }));
    expect(submitButton().disabled).toBe(true);
    expect(screen.getByText("The emails don't match")).toBeTruthy();
    await act(async () => fireEvent.change(screen.getByLabelText(/^Confirm email/), { target: { value: "minji@example.test" } }));
    expect(submitButton().disabled).toBe(false);
    await act(async () => fireEvent.click(submitButton()));
    expect(router.state.location.pathname).toBe("/bookings");

    const card = screen.getByRole("article");
    expect(within(card).getByText("Requested")).toBeTruthy();
    expect(card.textContent).toContain("1 h · 12:00–13:00");
    expect(card.textContent).toContain("₩20,000");
    await act(async () => fireEvent.click(within(card).getByRole("button", { name: "Cancel request" })));
    await act(async () => fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel request" })));
    expect(within(screen.getByRole("article")).getByText("Cancelled")).toBeTruthy();
    expect(within(screen.getByRole("article")).queryByRole("button", { name: "Cancel request" })).toBeNull();
  });
});

describe("예약 요청 — 저장된 코스(진입 ①): 숙소 복귀 ≤ 이용 종료(B1·B3)", () => {
  it("하이마트 코스 + 1h: 숙소 복귀가 이용 종료보다 늦고 공항 복귀도 늦음 → 경고 + 확인 체크해야 요청 가능", async () => {
    open("hotel-aura-incheon", withSaved("hotel-aura-incheon", ["sky72-outlet"]));
    await waitFor(() => expect(timing().textContent).toContain("Back at stay (luggage)13:46"));
    const t = timing().textContent!;
    expect(t).toContain("Check-in12:00");
    expect(t).toContain("Day-use ends13:00");
    expect(t).toContain("Expected airport arrival13:52");
    expect(t).toContain("You'll wait 14 min for check-in");
    const alert = within(timing()).getByRole("alert");
    expect(alert.textContent).toContain("13:46, 46 min after your day-use ends (13:00)");
    expect(alert.textContent).toContain("Expected airport arrival 13:52 is 21 min after your target 13:31");
    await fillContact();
    expect(submitButton().disabled).toBe(true);
    await act(async () => fireEvent.click(within(alert).getByRole("checkbox")));
    expect(submitButton().disabled).toBe(false);
  });

  it("늦은 슬롯 12:30: 코스 전체가 44분 늦어짐(숙소 복귀 14:16), 3h면 블록 초과 없음", async () => {
    open("hotel-aura-incheon", withSaved("hotel-aura-incheon", ["sky72-outlet"]));
    await waitFor(() => expect(timing().textContent).toContain("13:46"));
    await act(async () => fireEvent.click(slot("12:30")));
    await act(async () => fireEvent.click(product(/^3h/)));
    const t = timing().textContent!;
    expect(t).toContain("Back at stay (luggage)14:16");
    expect(t).toContain("Day-use ends15:30");
    expect(t).toContain("You'll wait 44 min");
    expect(within(timing()).getByRole("alert").textContent).not.toContain("day-use ends (");
  });
});

describe("견적 요청(가격표 없음)·노출·데모 아님", () => {
  it("가격표 없는 숙소(제휴 전, 공항 약 37분) → 견적 요청: 희망 이용 시간 12:30 – 12:54(숙소 출발 기한)", async () => {
    open("goldentulip-yeongjong");
    await waitFor(() => expect(screen.getByText("Requested time 12:30 – 12:54 (until you must leave the stay)")).toBeTruthy());
    expect(screen.getByRole("heading", { name: "Day-use quote request" })).toBeTruthy();
    expect(screen.getByText("Not a partner yet")).toBeTruthy();
    expect(screen.queryByRole("region", { name: "Choose a time block" })).toBeNull();
    await fillContact();
    expect(submitButton("Send quote request").disabled).toBe(false);
  });

  it("공항에서 먼 숙소(제휴 협의 중, 약 75분): 숙소 출발 기한이 슬롯보다 이르면 이용할 시간 없음 → 요청 불가", async () => {
    open("western-grace-hotel");
    await waitFor(() => expect(screen.getByText(/no time left to use the stay/)).toBeTruthy());
    expect(screen.getByText("Partnership in talks")).toBeTruthy();
    await fillContact();
    await act(async () => fireEvent.click(within(timing()).getByRole("checkbox")));
    expect(submitButton("Send quote request").disabled).toBe(true);
  });

  it("데모가 아니면: 확정 호텔만 열리고(데모 가격표 무시 → 견적 요청), 요청 버튼 비활성 + 준비 중, 데모 띠 없음", async () => {
    open("hotel-aura-incheon", { demo: false });
    await waitFor(() => expect(screen.getByText(/Requested time 12:00 – /)).toBeTruthy());
    expect(screen.queryByRole("note")).toBeNull();
    expect(screen.getByText("Booking requests aren't available yet")).toBeTruthy();
    await fillContact();
    expect(submitButton("Send quote request").disabled).toBe(true);
    cleanup();
    open("western-grace-hotel", { demo: false });
    expect(screen.getByText("We couldn't find this stay")).toBeTruthy();
  });

  it("데모가 아니면 홈 데이유즈 목록도 확정 호텔만", async () => {
    renderApp("/", { ...base, demo: false });
    const list = await screen.findByRole("list", { name: "Day-Use · Time Block Booking" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
  });

  it("진행 중인 요청이 있으면(B8) 안내 + 요청 불가", async () => {
    open("western-grace-hotel", { bookingRequests: [request({})] });
    await waitFor(() => expect(screen.getByText(/You already have an active request/)).toBeTruthy());
    await fillContact();
    expect(submitButton("Send quote request").disabled).toBe(true);
  });
});

describe("내 예약 — 확정·거절", () => {
  it("확정: 취소는 호텔 문의 + 연락처 + 규정 확인 중, 앱 안 취소 버튼 없음", async () => {
    renderApp("/bookings", { ...base, bookingRequests: [request({ status: "confirmed" })] });
    const card = screen.getByRole("article");
    expect(card.textContent).toContain("The hotel confirmed");
    expect(card.textContent).toContain("To cancel, please contact the hotel");
    expect(card.textContent).toContain("frontdesk@example.test");
    expect(card.textContent).toContain("Policy being confirmed");
    expect(within(card).queryByRole("button")).toBeNull();
  });

  it("거절: 사유 + 대안 숙소 3곳(거절한 숙소 제외, 공항에서 가까운 순) + 코스 다시 만들기 안내", async () => {
    renderApp("/bookings", { ...base, bookingRequests: [request({ status: "declined", declineReason: "Fully booked", planIds: ["sky72-outlet"] })] });
    const card = screen.getByRole("article");
    expect(card.textContent).toContain("Reason: Fully booked");
    const alts = within(within(card).getByRole("region", { name: "Other stays nearby" })).getAllByRole("link");
    expect(alts).toHaveLength(3);
    expect(alts.map((a) => a.getAttribute("href"))).not.toContain("/booking/hotel-aura-incheon");
    expect(card.textContent).toContain("rebuild your course");
  });
});

describe("코스 화면 — 진행 중인 요청이 있으면 슬롯·이용 종료가 코스 제약(B1)", () => {
  it("저장된 코스 + 요청(12:00, 1h): 체크인 대기 14분 막대, 숙소 복귀가 이용 종료보다 46분 늦음 경고", async () => {
    renderApp("/course/saved", {
      ...base,
      ...withSaved("hotel-aura-incheon", ["sky72-outlet"]),
      bookingRequests: [request({ hours: 1, endMin: 780 })],
    });
    const panel = () => screen.getByRole("region", { name: "My course" });
    await waitFor(() => expect(panel().textContent).toContain("Check-in wait 14 min"));
    expect(panel().textContent).toContain("You'd be back at your stay at 13:46, 46 min after your day-use ends (13:00)");
  });
});
