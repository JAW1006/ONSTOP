// 오류 코드 ↔ docs/api/errors.md 일치 테스트.
// 단일 출처는 그 문서다(docs/conventions.md 8장) — 코드에만 있거나 문서에만 있는 코드를 둘 다 잡는다.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { ERROR_CODES } from "./booking.js";

// errors.md "코드 목록"의 표 행만 뽑는다 — 첫 칸이 `BACKTICK_CODE`이고 둘째 칸이 HTTP 상태 숫자인 행.
// (문서의 다른 표, 예: "이 목록을 쓰는 API"는 이 모양이 아니라서 안 걸린다.)
const CODE_ROW = /^\| `([A-Z][A-Z0-9_]*)` +\| +\d+ +\|/gm;

function codesInDocs() {
  const doc = fs.readFileSync(new URL("../docs/api/errors.md", import.meta.url), "utf8");
  return new Set([...doc.matchAll(CODE_ROW)].map((m) => m[1]));
}

function codesInCode() {
  return new Set(Object.values(ERROR_CODES));
}

test("server/booking.js의 ERROR_CODES와 docs/api/errors.md의 코드 목록이 정확히 같다", () => {
  const inDocs = codesInDocs();
  const inCode = codesInCode();

  // 최소한의 안전장치 — 정규식이 아무것도 못 찾았다면 문서 구조가 바뀌어 테스트가 무력해진 것이다.
  assert.ok(inDocs.size > 0, "errors.md에서 코드 행을 하나도 못 찾았다 — 표 형식이 바뀌었는지 확인");
  assert.ok(inCode.size > 0, "ERROR_CODES가 비어 있다");

  const missingFromDocs = [...inCode].filter((c) => !inDocs.has(c));
  const missingFromCode = [...inDocs].filter((c) => !inCode.has(c));

  assert.deepEqual(missingFromDocs, [], "코드에는 있는데 docs/api/errors.md에 없는 코드 — 문서에 행을 추가한다");
  assert.deepEqual(
    missingFromCode,
    [],
    "docs/api/errors.md에는 있는데 코드에서 안 쓰는 코드 — 죽은 문서 행이거나 코드가 안 쓰는 것",
  );
});
