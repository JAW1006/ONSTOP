// 레거시 이후 추가한 i18n 키의 번역 검수 요청 표를 만든다.
// 실행: node scripts/i18n-review-table.mjs  → docs/design/i18n-review.md
// 키 목록·검수 여부: src/i18n/added-keys.json. 검수가 끝나면 reviewed를 true로 바꾸고 다시 실행한다.
import fs from "node:fs";

const LANGS = ["ko", "en", "zh", "ja", "vi"];
const added = JSON.parse(fs.readFileSync("src/i18n/added-keys.json", "utf8"));
const locales = Object.fromEntries(
  LANGS.map((l) => [l, JSON.parse(fs.readFileSync(`src/i18n/locales/${l}.json`, "utf8"))]),
);
const get = (obj, key) => key.split(".").reduce((o, k) => o?.[k], obj);
const cell = (s) => (s ?? "**누락**").replace(/\|/g, "\\|");

const keys = Object.keys(added).sort();
const pending = keys.filter((k) => !added[k].reviewed).length;
const rows = keys.map(
  (k) =>
    `| \`${k}\` | ${added[k].stage} | ${LANGS.map((l) => cell(get(locales[l], k))).join(" | ")} | ${added[k].reviewed ? "검수 완료" : "**미검수**"} |`,
);

fs.writeFileSync(
  "docs/design/i18n-review.md",
  `# 번역 검수 요청 — 레거시 이후 추가 문구

> 상태: 초안 · 생성: \`node scripts/i18n-review-table.mjs\` (손으로 고치지 말 것)
> 미검수 ${pending} / 전체 ${keys.length} · 원문은 ko, en은 개발자 작성, **zh·ja·vi는 기계 수준 초안**

## 검수 방법
- 각 언어 칸의 뜻이 ko 원문과 같은지, 앱 버튼·안내문으로 자연스러운지 확인한다.
- \`{{이름}}\`은 숫자·시각이 들어가는 자리표시자다. **지우거나 이름을 바꾸면 안 된다.**
- 고칠 문구는 이 표에 메모하거나 \`src/i18n/locales/<언어>.json\`을 직접 고친 뒤, \`src/i18n/added-keys.json\`의 \`reviewed\`를 \`true\`로 바꾸고 이 표를 다시 만든다.

| 키 | 쓰이는 곳 | ko(원문) | en | zh | ja | vi | 상태 |
|---|---|---|---|---|---|---|---|
${rows.join("\n")}
`,
);
console.log(`review table: ${keys.length} keys, ${pending} pending`);
