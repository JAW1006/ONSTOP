// 번역 원어민 검수 표를 만든다(정책: 공개 전 모든 번역은 원어민 검수 — docs/STATUS.md).
// 실행: node scripts/i18n-review-table.mjs
//   → docs/design/i18n-review.md        레거시 이후 추가·변경 키(+ 삭제한 키 목록)
//   → docs/design/i18n-review-legacy.md 레거시에서 옮긴 키 전체(삭제·변경 키 제외)
// 키 목록·검수 여부: src/i18n/added-keys.json(추가·변경·삭제), src/i18n/legacy-review.json(레거시 키 검수 완료 목록).
// 검수가 끝나면 해당 JSON의 reviewed/목록을 갱신하고 다시 실행한다.
import fs from "node:fs";

const LANGS = ["ko", "en", "zh", "ja", "vi"];
const added = JSON.parse(fs.readFileSync("src/i18n/added-keys.json", "utf8"));
const legacyReviewed = new Set(
  fs.existsSync("src/i18n/legacy-review.json")
    ? JSON.parse(fs.readFileSync("src/i18n/legacy-review.json", "utf8")).reviewed
    : [],
);
const locales = Object.fromEntries(
  LANGS.map((l) => [l, JSON.parse(fs.readFileSync(`src/i18n/locales/${l}.json`, "utf8"))]),
);
const get = (obj, key) => key.split(".").reduce((o, k) => o?.[k], obj);
const cell = (s) => (s ?? "**누락**").replace(/\|/g, "\\|");
const langCells = (k) => LANGS.map((l) => cell(get(locales[l], k))).join(" | ");

const HOW = `## 검수 방법
- 각 언어 칸의 뜻이 ko 원문과 같은지, 앱 버튼·안내문으로 자연스러운지 **원어민**이 확인한다(공개 전 전부 대상).
- \`{{이름}}\`은 숫자·시각이 들어가는 자리표시자다. **지우거나 이름을 바꾸면 안 된다.**
- 고칠 문구는 \`src/i18n/locales/<언어>.json\`을 고친 뒤 검수 완료를 기록하고 이 표를 다시 만든다.`;

/* ---- 추가·변경 키 ---- */
const keys = Object.keys(added)
  .filter((k) => added[k].kind !== "removed")
  .sort();
const removed = Object.keys(added)
  .filter((k) => added[k].kind === "removed")
  .sort();
const pending = keys.filter((k) => !added[k].reviewed).length;
const rows = keys.map(
  (k) =>
    `| \`${k}\` | ${added[k].kind === "changed" ? "레거시 변경" : "추가"} | ${added[k].stage} | ${langCells(k)} | ${added[k].reviewed ? "검수 완료" : "**미검수**"} |`,
);
fs.writeFileSync(
  "docs/design/i18n-review.md",
  `# 번역 검수 요청 — 레거시 이후 추가·변경 문구

> 상태: 초안 · 생성: \`node scripts/i18n-review-table.mjs\` (손으로 고치지 말 것)
> 미검수 ${pending} / 전체 ${keys.length} · 원문은 ko, en은 개발자 작성, **zh·ja·vi는 기계 수준 초안** · 레거시에서 옮긴 문구는 [i18n-review-legacy](i18n-review-legacy.md)

${HOW} 검수 완료는 \`src/i18n/added-keys.json\`의 \`reviewed\`를 \`true\`로.

| 키 | 종류 | 쓰이는 곳 | ko(원문) | en | zh | ja | vi | 상태 |
|---|---|---|---|---|---|---|---|---|
${rows.join("\n")}

## 삭제한 레거시 키 (검수 대상 아님)
| 키 | 사유 |
|---|---|
${removed.map((k) => `| \`${k}\` | ${added[k].stage} |`).join("\n")}
`,
);

/* ---- 레거시에서 옮긴 키 ---- */
const mapping = [
  ...fs.readFileSync("docs/design/i18n-keys.md", "utf8").matchAll(/^\| `([\w.]+)` \| `([\w.]+)` \|/gm),
].map((m) => m[2]);
const legacyKeys = mapping.filter((k) => !added[k]);
const legacyPending = legacyKeys.filter((k) => !legacyReviewed.has(k)).length;
fs.writeFileSync(
  "docs/design/i18n-review-legacy.md",
  `# 번역 검수 요청 — 레거시에서 옮긴 문구

> 상태: 초안 · 생성: \`node scripts/i18n-review-table.mjs\` (손으로 고치지 말 것)
> 미검수 ${legacyPending} / 전체 ${legacyKeys.length} · 레거시(\`app/index.html\` STR·CAT_LABELS)의 번역을 그대로 옮긴 것 — 출처·검수 이력 없음
> 레거시 이후 바꾼 키(변경 ${keys.filter((k) => added[k].kind === "changed").length}·삭제 ${removed.length})는 [i18n-review](i18n-review.md)에 있다.

${HOW} 검수 완료는 \`src/i18n/legacy-review.json\`의 \`reviewed\` 배열에 키를 추가.

| 키 | ko(원문) | en | zh | ja | vi | 상태 |
|---|---|---|---|---|---|---|
${legacyKeys.map((k) => `| \`${k}\` | ${langCells(k)} | ${legacyReviewed.has(k) ? "검수 완료" : "**미검수**"} |`).join("\n")}
`,
);
console.log(
  `review: added/changed ${keys.length} (${pending} pending), removed ${removed.length}; legacy ${legacyKeys.length} (${legacyPending} pending)`,
);
