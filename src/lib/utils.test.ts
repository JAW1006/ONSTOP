import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("커스텀 글자 크기와 색을 둘 다 남긴다", () => {
    expect(cn("text-caption text-ink")).toBe("text-caption text-ink");
  });
  it("같은 그룹끼리는 뒤엣것이 이긴다", () => {
    expect(cn("text-caption", "text-body")).toBe("text-body");
    expect(cn("text-ink", "text-faint")).toBe("text-faint");
    expect(cn("shadow-card", "shadow-primary")).toBe("shadow-primary");
  });
});
