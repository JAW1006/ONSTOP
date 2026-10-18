// 레거시 app/index.html의 ROOMS(10) · PLACES(7카테고리 22) · AD_PLACES · HOT_PLACE_IDS를 JSON으로 추출한다.
// 실행: node scripts/extract-legacy-data.mjs → src/data/legacy-data.json
// 이름·지역명은 데이터(5개 언어 객체)라 i18n JSON이 아니라 여기 둔다. 이미지 경로는 파일명만 남긴다(src/assets/hotel).
// JSON을 직접 고친 뒤에는 다시 실행하지 않는다.
import fs from "node:fs";

const src = fs.readFileSync("app/index.html", "utf8").split("\r\n").join("\n");
const evalExpr = (re, name) => {
  const m = src.match(re);
  if (!m) throw new Error(`${name} not found`);
  return new Function(`return ${m[1]}`)();
};

const ROOMS = evalExpr(/const ROOMS = (\[[\s\S]*?\n\]);\n/, "ROOMS");
const PLACES = evalExpr(/const PLACES = (\{[\s\S]*?\n\});\n/, "PLACES");
const AD_PLACES = [...evalExpr(/const AD_PLACES = (new Set\(\[[^\]]*\]\));/, "AD_PLACES")];
const HOT_PLACE_IDS = evalExpr(/const HOT_PLACE_IDS = (\[[^\]]*\]);/, "HOT_PLACE_IDS");

// 레거시 필드명 move/dur(분 단위)는 단위 접미사가 없어 docs/conventions.md 4장 규칙과 어긋난다 —
// 추출 시점에 moveMin/durMin으로 바꿔서 내보낸다(이 스크립트를 다시 돌려도 이름이 유지되게).
const rooms = ROOMS.map(({ move, ...r }) => ({ ...r, moveMin: move, img: r.img ? r.img.split("/").pop() : null }));
const places = Object.entries(PLACES).flatMap(([cat, arr]) =>
  arr.map(({ move, dur, ...p }) => ({ ...p, cat, moveMin: move, durMin: dur })),
);

const ids = [...rooms.map((r) => r.id), ...places.map((p) => p.id)];
if (new Set(ids).size !== ids.length) throw new Error("duplicate id");
for (const id of [...AD_PLACES, ...HOT_PLACE_IDS])
  if (!places.some((p) => p.id === id)) throw new Error(`unknown place ${id}`);

fs.mkdirSync("src/data", { recursive: true });
fs.writeFileSync(
  "src/data/legacy-data.json",
  JSON.stringify(
    { source: "app/index.html (legacy)", rooms, places, adPlaceIds: AD_PLACES, hotPlaceIds: HOT_PLACE_IDS },
    null,
    2,
  ) + "\n",
);
console.log(`rooms ${rooms.length}, places ${places.length}, ad ${AD_PLACES.length}, hot ${HOT_PLACE_IDS.length}`);
