import fs from "node:fs";
import { describe, expect, it } from "vitest";
import i18n, { resources } from "./index";
import { LANGUAGE_CODES } from "./languages";
import addedKeys from "./added-keys.json";

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

// 레거시 이후 추가한 키 — src/i18n/added-keys.json (검수 표: docs/design/i18n-review.md)
type AddedEntry = { stage: string; reviewed: boolean; kind?: "changed" | "removed" };
const entries = Object.entries(addedKeys as Record<string, AddedEntry>);
/** 레거시 이후 새로 만든 키 */
const ADDED_KEYS = entries
  .filter(([, e]) => !e.kind)
  .map(([k]) => k)
  .sort();
/** 레거시 키지만 문구를 의도적으로 바꾼 키 — 원문 대조에서 제외 */
const CHANGED_KEYS = new Set(entries.filter(([, e]) => e.kind === "changed").map(([k]) => k));
/** 레거시 키지만 기능이 없어 의도적으로 지운 키 — 존재·원문 대조에서 제외 */
const REMOVED_KEYS = new Set(entries.filter(([, e]) => e.kind === "removed").map(([k]) => k));

describe("locales", () => {
  it("레거시 190개 문구 + 3단계 이후 추가 키", () => {
    const table = fs.readFileSync("docs/design/i18n-keys.md", "utf8");
    const legacyKeys = [...table.matchAll(/^\| `[\w.]+` \| `([\w.]+)` \|/gm)].map((m) => m[1]!);
    expect(legacyKeys).toHaveLength(190);
    expect(koKeys).toEqual(expect.arrayContaining(legacyKeys.filter((k) => !REMOVED_KEYS.has(k))));
    for (const k of REMOVED_KEYS) expect(koKeys).not.toContain(k);
    expect(koKeys.filter((k) => !legacyKeys.includes(k)).sort()).toEqual(ADDED_KEYS);
  });

  it.each(LANGUAGE_CODES)("%s: 키 집합이 ko와 같다", (lang) => {
    expect(Object.keys(flat[lang]!).sort()).toEqual(koKeys);
  });

  it.each(LANGUAGE_CODES)("%s: 자리표시자가 ko와 같다", (lang) => {
    for (const key of koKeys)
      expect([key, placeholders(flat[lang]![key]!)]).toEqual([key, placeholders(flat.ko![key]!)]);
  });

  it("레거시 STR 원문과 일치({x} → {{x}} 변환 외 차이 없음)", () => {
    const src = fs.readFileSync("app/index.html", "utf8").split("\r\n").join("\n");
    const STR = new Function(`return ${src.match(/const STR = (\{[\s\S]*?\n\});\n/)![1]}`)();
    const table = fs.readFileSync("docs/design/i18n-keys.md", "utf8");
    const map = [...table.matchAll(/^\| `(\w+)` \| `([\w.]+)` \|/gm)].map((m) => [m[1]!, m[2]!] as const);
    expect(map).toHaveLength(183);
    for (const [legacy, key] of map)
      if (!CHANGED_KEYS.has(key) && !REMOVED_KEYS.has(key))
        for (const lang of LANGUAGE_CODES)
          expect([key, lang, flat[lang]![key]]).toEqual([key, lang, STR[legacy][lang].replace(/\{(\w+)\}/g, "{{$1}}")]);
  });
});

describe("검수 표", () => {
  it("docs/design/i18n-review.md가 현재 JSON과 같다(scripts/i18n-review-table.mjs로 재생성)", () => {
    const doc = fs.readFileSync("docs/design/i18n-review.md", "utf8");
    for (const key of [...ADDED_KEYS, ...CHANGED_KEYS])
      for (const lang of LANGUAGE_CODES) expect(doc).toContain(flat[lang]![key]!.replace(/\|/g, "\\|"));
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
