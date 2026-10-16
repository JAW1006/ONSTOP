// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router";
import i18n from "@/i18n";
import { routes } from "@/app/router";

const renderAt = (path: string) => render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />);
const current = () => screen.getAllByRole("link").filter((a) => a.getAttribute("aria-current") === "page").map((a) => a.textContent);

describe("TabBar", () => {
  beforeEach(() => i18n.changeLanguage("en"));
  afterEach(cleanup);

  it("탭 5개(가운데 코스 포함)를 현재 언어로 보여준다", () => {
    renderAt("/");
    expect(screen.getAllByRole("link").map((a) => a.textContent)).toEqual(["Home", "Luggage", "Course", "Bookings", "My"]);
  });

  it.each([
    ["/", "Home"],
    ["/luggage", "Luggage"],
    ["/course", "Course"],
    ["/course/saved", "Course"],
    ["/booking/hotel-aura-incheon", "Bookings"],
    ["/bookings", "Bookings"],
    ["/my", "My"],
  ])("%s → 활성 탭 %s 하나만", (path, label) => {
    renderAt(path);
    expect(current()).toEqual([label]);
  });

  it("온보딩에서는 탭바가 없다", () => {
    renderAt("/onboarding");
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("언어를 바꾸면 탭 이름이 바뀐다", async () => {
    await i18n.changeLanguage("ko");
    renderAt("/");
    expect(screen.getAllByRole("link").map((a) => a.textContent)).toEqual(["홈", "짐 케어", "코스", "예약", "마이"]);
  });
});
