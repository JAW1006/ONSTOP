import fs from "node:fs";
import { describe, expect, it } from "vitest";
import i18n, { resources } from "./index";
import { LANGUAGE_CODES } from "./languages";

type Tree = { [k: string]: string | Tree };
const flatten = (o: Tree, prefix = ""): Record<string, string> =>
  Object.entries(o).reduce<Record<string, string>>((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    return typeof v === "string" ? { ...acc, [key]: v } : { ...acc, ...flatten(v, key) };
  }, {});
const placeholders = (s: string) => [...s.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort();

const flat = Object.fromEntries(
  LANGUAGE_CODES.map((l) => [l, flatten(resources[l].translation as unknown as Tree)]),
) as Record<string, Record<string, string>>;
const koKeys = Object.keys(flat.ko!).sort();

describe("locales", () => {
  it("레거시 190개 문구", () => {
    expect(koKeys).toHaveLength(190);
  });

  it.each(LANGUAGE_CODES)("%s: 키 집합이 ko와 같다", (lang) => {
    expect(Object.keys(flat[lang]!).sort()).toEqual(koKeys);
  });

  it.each(LANGUAGE_CODES)("%s: 자리표시자가 ko와 같다", (lang) => {
    for (const key of koKeys) expect([key, placeholders(flat[lang]![key]!)]).toEqual([key, placeholders(flat.ko![key]!)]);
  });

  it("레거시 STR 원문과 일치({x} → {{x}} 변환 외 차이 없음)", () => {
    const src = fs.readFileSync("app/index.html", "utf8").split("\r\n").join("\n");
    const STR = new Function(`return ${src.match(/const STR = (\{[\s\S]*?\n\});\n/)![1]}`)();
    const table = fs.readFileSync("docs/design/i18n-keys.md", "utf8");
    const map = [...table.matchAll(/^\| `(\w+)` \| `([\w.]+)` \|/gm)].map((m) => [m[1]!, m[2]!] as const);
    expect(map).toHaveLength(183);
    for (const [legacy, key] of map)
      for (const lang of LANGUAGE_CODES)
        expect([key, lang, flat[lang]![key]]).toEqual([key, lang, STR[legacy][lang].replace(/\{(\w+)\}/g, "{{$1}}")]);
  });
});

describe("i18next 동작", () => {
  it("보간", () => {
    expect(i18n.t("unit.hoursMinutes", { lng: "en", h: 2, m: 11 })).toBe("2h 11m");
    expect(i18n.t("unit.hoursMinutes", { lng: "ko", h: 2, m: 11 })).toBe("2시간 11분");
  });
  it("의도된 빈 문자열은 폴백하지 않는다", () => {
    expect(i18n.t("home.timeFit.build.suffix", { lng: "en" })).toBe("");
    expect(i18n.t("home.timeFit.build.suffix", { lng: "ko" })).toBe("를 만들어보세요");
  });
});
