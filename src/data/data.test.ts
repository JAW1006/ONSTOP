import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { formatKrw } from "@/lib/format";
import { AD_PLACE_IDS, HOT_PLACES, localize, PLACES, ROOMS, roomImage } from "./index";

describe("레거시 데이터", () => {
  it("숙소 10, 장소 22(7개 카테고리), 제휴 AD 7, 핫플레이스 6", () => {
    expect(ROOMS).toHaveLength(10);
    expect(PLACES).toHaveLength(22);
    expect(new Set(PLACES.map((p) => p.cat))).toEqual(new Set(["Food", "Massage", "Shopping", "Rest", "Beauty", "Sightseeing", "Brand"]));
    expect(AD_PLACE_IDS.size).toBe(7);
    expect(HOT_PLACES.map((p) => p.id)).toEqual([
      "olive-young-kbeauty",
      "chinatown-dimsum",
      "airport-spa-foot",
      "sky72-outlet",
      "shilla-pickup",
      "premium-lounge-partner",
    ]);
  });

  it("레거시 원문과 값이 같다(숙소 가격·시간대·이동시간)", () => {
    const src = fs.readFileSync("app/index.html", "utf8").split("\r\n").join("\n");
    // app/index.html(레거시 원문)은 아직 move 필드명 그대로다 — 이 레포(ROOMS)만 moveMin으로 통일했다(2026-10-19).
    const legacy = new Function(`return ${src.match(/const ROOMS = (\[[\s\S]*?\n\]);\n/)![1]}`)() as (Omit<(typeof ROOMS)[number], "moveMin"> & { move: number })[];
    expect(ROOMS.map(({ id, price, hourMin, hourMax, distMin, moveMin }) => ({ id, price, hourMin, hourMax, distMin, moveMin }))).toEqual(
      legacy.map(({ id, price, hourMin, hourMax, distMin, move }) => ({ id, price, hourMin, hourMax, distMin, moveMin: move })),
    );
  });

  it("숙소 사진 10장 모두 연결", () => {
    expect(ROOMS.every((r) => typeof roomImage(r) === "string")).toBe(true);
  });

  it("현지화: 없는 언어는 ko", () => {
    expect(localize(PLACES[0]!.area, "ja")).toBe("仁川チャイナタウン");
    expect(localize(PLACES[0]!.area, "xx")).toBe("인천 차이나타운");
  });

  it("원화 표기", () => {
    expect(formatKrw(50000)).toBe("₩50,000");
  });
});
