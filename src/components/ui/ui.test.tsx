// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { BottomSheet } from "./bottom-sheet";
import { Button } from "./button";
import { Chip } from "./chip";
import { PageHeader } from "./page-header";
import { SectionHeader } from "./section-header";
import { Switch } from "./switch";

beforeEach(() => i18n.changeLanguage("en"));
afterEach(cleanup);

describe("Button", () => {
  it("disabled면 클릭이 안 된다", () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Pay
      </Button>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Pay" }));
    expect(onClick).not.toHaveBeenCalled();
  });
  it("기본 type은 button(폼 제출 방지)", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button").getAttribute("type")).toBe("button");
  });
});

describe("Chip", () => {
  it("선택 상태를 aria-pressed로 노출", () => {
    render(<Chip active>Food</Chip>);
    expect(screen.getByRole("button", { name: "Food" }).getAttribute("aria-pressed")).toBe("true");
  });
});

describe("헤더", () => {
  it("PageHeader 뒤로 버튼은 번역된 aria-label", () => {
    const onBack = vi.fn();
    render(<PageHeader title="Booking" onBack={onBack} />);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onBack).toHaveBeenCalled();
  });
  it("SectionHeader 더보기", () => {
    render(<SectionHeader title="Hot Places" onMore={() => {}} />);
    expect(screen.getByRole("button").textContent).toBe("More ");
  });
});

describe("BottomSheet", () => {
  function Harness() {
    const [open, setOpen] = useState(true);
    return (
      <BottomSheet open={open} onOpenChange={setOpen} title="Language Settings">
        <p>body</p>
      </BottomSheet>
    );
  }
  it("제목을 dialog 이름으로 쓰고, 닫기 버튼으로 닫힌다", async () => {
    render(<Harness />);
    expect(screen.getByRole("dialog", { name: "Language Settings" })).toBeTruthy();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Dismiss" })));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("Switch", () => {
  it("클릭하면 토글", () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="alerts" defaultChecked onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole("switch", { name: "alerts" }));
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });
});
