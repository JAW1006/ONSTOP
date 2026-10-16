// 숙소·장소 데이터 중 미검증 값 목록을 만든다.
// 실행: node scripts/data-verification-table.mjs → docs/design/data-verification.md
// 원본: src/data/legacy-data.json. 값을 확인하면 JSON을 고치고, 확인 기록은 src/data/verification.json에 남긴 뒤 다시 실행한다.
import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("src/data/legacy-data.json", "utf8"));
const done = fs.existsSync("src/data/verification.json") ? JSON.parse(fs.readFileSync("src/data/verification.json", "utf8")) : {};
const won = (n) => `₩${n.toLocaleString("en-US")}`;
const status = (id, field) => (done[`${id}.${field}`] ? `확인(${done[`${id}.${field}`]})` : "**미검증**");

const roomRows = data.rooms.flatMap((r) => [
  [r.id, r.name.ko, "기본가(hourMin 기준)", won(r.price), "숙소 제휴 요율표·계약서, 또는 숙소에 데이유즈 요금 문의", "price"],
  [r.id, r.name.ko, "이용 시간 범위", `${r.hourMin}–${r.hourMax}시간`, "숙소에 데이유즈 가능 시간대·최소/최대 시간 문의(A9: 기획 3–9시간)", "hours"],
  [r.id, r.name.ko, "평점", String(r.rate), "출처 정하기(자체 리뷰 / 외부 평점 표기 허락) — 출처 없으면 표시 안 함 검토", "rate"],
  [r.id, r.name.ko, "리뷰 수", String(r.cnt), "평점과 같음", "cnt"],
  [r.id, r.name.ko, "사진", r.img ?? "없음", "사진 출처·사용 허락 확인([legal-checklist](../legal-checklist.md) 4-3)", "img"],
]);
const placeRows = data.places.flatMap((p) => [
  [p.id, p.name.ko, `체류 시간(${p.cat})`, `${p.dur}분`, "업종별 평균 이용 시간 기준 정하기(업체 문의·현장 측정·예약 상품 시간)", "dur"],
  [p.id, p.name.ko, "가격", p.price > 0 ? won(p.price) : "0(표시 안 함)", p.price > 0 ? "업체 메뉴판·요금표 확인(기준일 기록)" : "무료 입장·쇼핑이면 그대로, 아니면 대표 가격 조사", "price"],
  [p.id, p.name.ko, "영업 여부·영업시간", "데이터 없음", "카카오맵·업체 확인 — 영업시간 필드 추가 여부 결정", "open"],
]);
const table = (rows) =>
  rows.map(([id, name, item, value, how, field]) => `| \`${id}\` | ${name} | ${item} | ${value} | ${how} | ${status(id, field)} |`).join("\n");

fs.writeFileSync(
  "docs/design/data-verification.md",
  `# 숙소·장소 미검증 데이터 목록

> 상태: 초안 · 생성: \`node scripts/data-verification-table.mjs\` (손으로 고치지 말 것) · 원본: \`src/data/legacy-data.json\`
> 출처 설명: [data](data.md). 업체 이름·좌표·공항→숙소 이동시간은 레거시에서 카카오로 확인한 값이라 이 표에서 뺐다(좌표 저장의 약관 문제는 [legal-checklist](../legal-checklist.md) 5-2).
> 확인하면 값은 \`legacy-data.json\`에서 고치고, \`src/data/verification.json\`에 \`"<id>.<항목>": "YYYY-MM-DD 확인자 근거"\`를 넣은 뒤 다시 생성한다. 항목 키: price, hours, rate, cnt, img, dur, open.

## 숙소 ${data.rooms.length}곳
| id | 이름 | 항목 | 현재 값 | 확인 방법 | 상태 |
|---|---|---|---|---|---|
${table(roomRows)}

## 장소 ${data.places.length}곳
| id | 이름 | 항목 | 현재 값 | 확인 방법 | 상태 |
|---|---|---|---|---|---|
${table(placeRows)}

## 공통 확인 사항
| 항목 | 내용 |
|---|---|
| 중복 지점 | 올리브영 운서점·테르엔 힐링센터가 쇼핑/휴식과 브랜드에 같은 실제 지점으로 중복(레거시 의도) — 운영 시 하나로 합칠지 |
| 제휴 여부 | 실존 업체지만 제휴 여부 기록 없음 — 제휴 전 노출 방침([legal-checklist](../legal-checklist.md) 4-4) |
| 다국어 이름 | zh·ja·vi 이름 대부분이 영문 그대로 — 공식 외국어 상호 확인 |
| 장소 \`move\` | 레거시 더미값, 새 앱 계산에 안 씀 — 운영 데이터에서 제거 검토 |
`,
);
console.log(`rooms ${roomRows.length} rows, places ${placeRows.length} rows`);
