// 예약 요청 API 통합 테스트 — **진짜 PostgreSQL**에 붙어서 돈다(모의 DB 아님).
// 명세: docs/api/booking-requests.md · 확인 항목: docs/STATUS.md "DB 연결 후 확인할 것"
//
// 실행:  cd server && npm run test:db          (docker compose로 일회용 Postgres를 띄운다)
//        또는 TEST_DATABASE_URL=... node --test booking.test.js
//
// ⚠ 이 테스트는 booking_requests를 TRUNCATE한다. 아래 가드가 운영·개발 DB를 가리키면 실행을 거부한다.
import test, { before, after, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import pg from "pg";
import { mountBookingRequests } from "./booking.js";

// ---------------------------------------------------------------------------
// 안전 가드 — 실수로 실제 DB를 비우는 일을 막는다.
// ---------------------------------------------------------------------------
const TEST_DB = process.env.TEST_DATABASE_URL;
const ALLOW_REMOTE = process.env.ALLOW_REMOTE_TEST_DB === "1";

function guardReason() {
  if (!TEST_DB) {
    return "TEST_DATABASE_URL이 없다. `npm run test:db`로 일회용 Postgres를 띄워 실행한다.";
  }
  // 이 테스트는 데이터를 지운다. DATABASE_URL(실제 DB)과 같으면 무조건 거부한다.
  if (process.env.DATABASE_URL && process.env.DATABASE_URL === TEST_DB) {
    throw new Error("TEST_DATABASE_URL이 DATABASE_URL과 같다 — 실제 DB를 비울 수 있어 중단한다.");
  }
  const host = /@([^/:?]+)/.exec(TEST_DB)?.[1] ?? "";
  const isLocal = /^(localhost|127\.0\.0\.1|postgres|db)$/.test(host);
  if (!isLocal && !ALLOW_REMOTE) {
    throw new Error(
      `TEST_DATABASE_URL 호스트가 로컬이 아니다(${host}). 이 테스트는 테이블을 TRUNCATE한다. ` +
        "일회용 DB가 확실하면 ALLOW_REMOTE_TEST_DB=1 을 함께 준다.",
    );
  }
  return null;
}

const skip = guardReason();
// node:test는 skip 키가 있으면 값과 무관하게 건너뛴다 — 이유가 있을 때만 옵션을 넘긴다.
const suiteOpts = skip ? { skip } : {};

// ---------------------------------------------------------------------------
const ADMIN = { user: "test-admin", password: "test-password" };
const CONSENT = { privacy: true, thirdParty: true, disclaimer: true };

const newRequest = (over = {}) => ({
  roomId: "hotel-aura",
  mode: "product",
  checkInMin: 750,
  endMin: 930,
  hours: 3,
  price: 50000,
  priceSource: "demo",
  planIds: ["spot-12", "spot-07"],
  name: "KIM JINHO",
  email: "traveler@example.com",
  lang: "ko",
  consent: CONSENT,
  consentVersion: "2026-10-18-draft",
  ...over,
});

let base;
let server;
let pool;
let booking;
let errorLogs = [];
let realError;

describe("예약 요청 API (진짜 Postgres)", suiteOpts, () => {
  before(async () => {
    // mountBookingRequests는 호출 시점의 process.env를 읽는다.
    process.env.DATABASE_URL = TEST_DB;
    process.env.ADMIN_USER = ADMIN.user;
    process.env.ADMIN_PASSWORD = ADMIN.password;

    // 로그에 이메일·이름이 섞이지 않는지 보기 위해 console.error를 모은다.
    realError = console.error;
    console.error = (...args) => {
      errorLogs.push(args.map(String).join(" "));
    };

    const app = express();
    booking = mountBookingRequests(app);
    await booking.init(); // 확인 1 — 마이그레이션

    pool = new pg.Pool({ connectionString: TEST_DB, ssl: false });
    server = app.listen(0);
    await new Promise((r) => server.once("listening", r));
    base = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    console.error = realError;
    await pool?.end();
    await new Promise((r) => server?.close(r) ?? r());
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE booking_requests");
  });

  // --- 호출 도우미 ---------------------------------------------------------
  const authHeader = (u = ADMIN.user, p = ADMIN.password) => "Basic " + Buffer.from(`${u}:${p}`).toString("base64");

  async function call(method, path, { body, auth } = {}) {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(auth ? { Authorization: auth } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const json = await res.json().catch(() => null);
    return { status: res.status, body: json };
  }

  const create = (over) => call("POST", "/api/booking-requests", { body: newRequest(over) });

  // --- 확인 1: 마이그레이션 -----------------------------------------------
  it("1. 마이그레이션이 테이블·제약·B8 인덱스를 만들고, 두 번 돌려도 한 번만 적용된다", async () => {
    const applied = await pool.query("SELECT filename FROM schema_migrations ORDER BY filename");
    assert.deepEqual(
      applied.rows.map((r) => r.filename),
      ["001_booking_requests.sql"],
    );

    await booking.init(); // 다시 실행해도 중복 적용되지 않아야 한다
    const again = await pool.query("SELECT count(*)::int AS n FROM schema_migrations");
    assert.equal(again.rows[0].n, 1);

    const idx = await pool.query(
      "SELECT indexdef FROM pg_indexes WHERE tablename = 'booking_requests' AND indexname = $1",
      ["booking_requests_one_active_per_email"],
    );
    assert.equal(idx.rows.length, 1, "B8 부분 유니크 인덱스가 있어야 한다");
    assert.match(idx.rows[0].indexdef, /UNIQUE/i);
    assert.match(idx.rows[0].indexdef, /requested/);
  });

  // --- 확인 2: 생성 --------------------------------------------------------
  it("2. 정상 요청은 201 + TS- 8자 요청번호, 보낸 값이 그대로 저장된다", async () => {
    const { status, body } = await create();
    assert.equal(status, 201);
    const r = body.request;
    assert.match(r.id, /^TS-[0-9A-HJKMNP-TV-Z]{8}$/);
    assert.equal(r.status, "requested");
    assert.equal(r.email, "traveler@example.com");
    assert.equal(r.checkInMin, 750);
    assert.equal(r.endMin, 930);
    assert.equal(r.price, 50000);
    assert.deepEqual(r.planIds, ["spot-12", "spot-07"]);
    assert.equal(r.expiresAt, null, "기한 값이 미정이라 항상 null이다");
    assert.equal(r.declineReason, null);
    assert.ok(r.consentedAt, "동의 시각이 남아야 한다");
    assert.equal(r.consentVersion, "2026-10-18-draft");
    // 내부 판정용 컬럼은 응답에 나오지 않는다.
    assert.equal("emailNormalized" in r, false);
    assert.equal("email_normalized" in r, false);
  });

  it("2b. 견적 요청(mode=quote)은 hours 없이도 만들어진다", async () => {
    const { status, body } = await create({ mode: "quote", hours: null, price: null, priceSource: null });
    assert.equal(status, 201);
    assert.equal(body.request.mode, "quote");
    assert.equal(body.request.hours, null);
  });

  it("2c. 잘못된 입력은 400이고 저장되지 않는다", async () => {
    const cases = [
      [{ consent: { privacy: true, thirdParty: false, disclaimer: true } }, "BOOKING_CONSENT_REQUIRED"],
      [{ email: "not-an-email" }, "BOOKING_INVALID_EMAIL"],
      [{ mode: "product", hours: null }, "BOOKING_INVALID_FIELD"],
      [{ lang: "de" }, "BOOKING_INVALID_FIELD"],
      [{ roomId: "" }, "BOOKING_INVALID_FIELD"],
      [{ planIds: ["ok", ""] }, "BOOKING_INVALID_FIELD"],
    ];
    for (const [over, code] of cases) {
      const { status, body } = await create(over);
      assert.equal(status, 400, `${code} 케이스는 400이어야 한다`);
      assert.equal(body.error.code, code);
    }
    const { rows } = await pool.query("SELECT count(*)::int AS n FROM booking_requests");
    assert.equal(rows[0].n, 0);
  });

  // --- 확인 3·4: B8 ---------------------------------------------------------
  it("3. 같은 이메일로 또 요청하면 409이고, 본문에 기존 요청 내용이 없다", async () => {
    await create();
    const { status, body } = await create({ roomId: "다른-호텔" });
    assert.equal(status, 409);
    assert.equal(body.error.code, "BOOKING_ACTIVE_REQUEST_EXISTS");
    // 존재 여부만 알려준다 — 요청번호·숙소·시각이 새어나가면 안 된다.
    const text = JSON.stringify(body);
    assert.equal(/TS-/.test(text), false, "요청번호가 새어나갔다");
    assert.equal(/hotel-aura|다른-호텔/.test(text), false, "숙소가 새어나갔다");
    assert.equal(/750|930/.test(text), false, "시각이 새어나갔다");
  });

  it("4. 대문자·공백이 섞인 같은 이메일도 같은 사람으로 보고 409", async () => {
    await create({ email: "traveler@example.com" });
    const { status, body } = await create({ email: "  TRAVELER@Example.COM  " });
    assert.equal(status, 409);
    assert.equal(body.error.code, "BOOKING_ACTIVE_REQUEST_EXISTS");
  });

  it("4b. 동시에 보내도 DB가 막아서 한 건만 생긴다", async () => {
    const results = await Promise.all([create(), create(), create(), create()]);
    const created = results.filter((r) => r.status === 201);
    const blocked = results.filter((r) => r.status === 409);
    assert.equal(created.length, 1, "한 건만 성공해야 한다");
    assert.equal(blocked.length, 3);
    const { rows } = await pool.query("SELECT count(*)::int AS n FROM booking_requests");
    assert.equal(rows[0].n, 1);
  });

  // --- 확인 5: 조회 ---------------------------------------------------------
  it("5. 조회는 요청번호 + 이메일이 둘 다 맞아야 하고, 틀리면 없는 것과 구분되지 않는다", async () => {
    const { body } = await create();
    const id = body.request.id;

    const ok = await call("GET", `/api/booking-requests/${id}?email=traveler@example.com`);
    assert.equal(ok.status, 200);
    assert.equal(ok.body.request.id, id);

    // 대소문자가 달라도 같은 사람으로 본다.
    const normalized = await call("GET", `/api/booking-requests/${id}?email=TRAVELER%40EXAMPLE.COM`);
    assert.equal(normalized.status, 200);

    const wrongEmail = await call("GET", `/api/booking-requests/${id}?email=someone@else.com`);
    const noSuchId = await call("GET", `/api/booking-requests/TS-00000000?email=traveler@example.com`);
    assert.equal(wrongEmail.status, 404);
    assert.equal(noSuchId.status, 404);
    // 두 응답이 같아야 요청번호의 존재 여부가 드러나지 않는다.
    assert.deepEqual(wrongEmail.body, noSuchId.body);

    const noEmail = await call("GET", `/api/booking-requests/${id}`);
    assert.equal(noEmail.status, 400);
    assert.equal(noEmail.body.error.code, "BOOKING_EMAIL_REQUIRED");
  });

  // --- 확인 6·7: 취소 -------------------------------------------------------
  it("6. 요청됨은 취소되고, 다시 취소하면 409", async () => {
    const { body } = await create();
    const id = body.request.id;

    const first = await call("POST", `/api/booking-requests/${id}/cancel`, {
      body: { email: "traveler@example.com" },
    });
    assert.equal(first.status, 200);
    assert.equal(first.body.request.status, "cancelled");

    const second = await call("POST", `/api/booking-requests/${id}/cancel`, {
      body: { email: "traveler@example.com" },
    });
    assert.equal(second.status, 409);
    assert.equal(second.body.error.code, "BOOKING_NOT_CANCELLABLE");
    assert.equal(second.body.error.status, "cancelled");
  });

  it("6b. 확정된 요청은 앱에서 취소할 수 없다 (호텔 문의 안내)", async () => {
    const { body } = await create();
    const id = body.request.id;
    await call("PATCH", `/api/booking-requests/${id}`, {
      body: { status: "confirmed" },
      auth: authHeader(),
    });

    const res = await call("POST", `/api/booking-requests/${id}/cancel`, {
      body: { email: "traveler@example.com" },
    });
    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, "BOOKING_NOT_CANCELLABLE");
    assert.equal(res.body.error.status, "confirmed");
  });

  it("6c. 다른 사람 이메일로는 취소할 수 없다", async () => {
    const { body } = await create();
    const res = await call("POST", `/api/booking-requests/${body.request.id}/cancel`, {
      body: { email: "someone@else.com" },
    });
    assert.equal(res.status, 404);
  });

  it("7. 취소한 뒤에는 같은 이메일로 새 요청을 보낼 수 있다 (종료 상태는 B8에 안 걸림)", async () => {
    const { body } = await create();
    await call("POST", `/api/booking-requests/${body.request.id}/cancel`, {
      body: { email: "traveler@example.com" },
    });
    const again = await create();
    assert.equal(again.status, 201);
  });

  // --- 확인 8·9: 상태 전이 --------------------------------------------------
  it("8. 허용되지 않는 전이는 409 invalid_transition", async () => {
    const { body } = await create();
    const id = body.request.id;

    const confirm = await call("PATCH", `/api/booking-requests/${id}`, {
      body: { status: "confirmed" },
      auth: authHeader(),
    });
    assert.equal(confirm.status, 200);
    assert.equal(confirm.body.request.status, "confirmed");

    // confirmed에서 갈 수 있는 곳은 cancelled뿐이다.
    for (const to of ["declined", "expired", "requested"]) {
      const res = await call("PATCH", `/api/booking-requests/${id}`, {
        body: { status: to, declineReason: "사유" },
        auth: authHeader(),
      });
      assert.equal(res.status, 409, `confirmed → ${to}는 막아야 한다`);
      assert.equal(res.body.error.code, "BOOKING_INVALID_TRANSITION");
      assert.equal(res.body.error.from, "confirmed");
      assert.equal(res.body.error.to, to);
    }
  });

  it("8b. 종료 상태에서는 어디로도 못 간다", async () => {
    const { body } = await create();
    const id = body.request.id;
    await call("PATCH", `/api/booking-requests/${id}`, {
      body: { status: "declined", declineReason: "만실" },
      auth: authHeader(),
    });
    const res = await call("PATCH", `/api/booking-requests/${id}`, {
      body: { status: "confirmed" },
      auth: authHeader(),
    });
    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, "BOOKING_INVALID_TRANSITION");
  });

  it("9. 거절은 사유가 있어야 하고, 사유가 저장돼 조회에 나온다", async () => {
    const { body } = await create();
    const id = body.request.id;

    const noReason = await call("PATCH", `/api/booking-requests/${id}`, {
      body: { status: "declined" },
      auth: authHeader(),
    });
    assert.equal(noReason.status, 400);
    assert.equal(noReason.body.error.code, "BOOKING_DECLINE_REASON_REQUIRED");

    const withReason = await call("PATCH", `/api/booking-requests/${id}`, {
      body: { status: "declined", declineReason: "해당 시간대 만실" },
      auth: authHeader(),
    });
    assert.equal(withReason.status, 200);
    assert.equal(withReason.body.request.declineReason, "해당 시간대 만실");

    const read = await call("GET", `/api/booking-requests/${id}?email=traveler@example.com`);
    assert.equal(read.body.request.declineReason, "해당 시간대 만실");
  });

  it("9b. 없는 상태값은 400", async () => {
    const { body } = await create();
    const res = await call("PATCH", `/api/booking-requests/${body.request.id}`, {
      body: { status: "paid" },
      auth: authHeader(),
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, "BOOKING_INVALID_STATUS");
  });

  // --- 확인 10: 인증 --------------------------------------------------------
  it("10. 관리자 API는 인증이 있어야 한다", async () => {
    await create();

    const anon = await call("GET", "/api/booking-requests");
    assert.equal(anon.status, 401);
    assert.equal(anon.body.error.code, "ADMIN_UNAUTHORIZED");

    const wrongPw = await call("GET", "/api/booking-requests", { auth: authHeader(ADMIN.user, "틀림") });
    assert.equal(wrongPw.status, 401);

    const wrongUser = await call("GET", "/api/booking-requests", { auth: authHeader("남", ADMIN.password) });
    assert.equal(wrongUser.status, 401);

    const ok = await call("GET", "/api/booking-requests", { auth: authHeader() });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.total, 1);
    assert.equal(ok.body.requests.length, 1);

    // 상태 변경도 인증이 필요하다.
    const patchAnon = await call("PATCH", `/api/booking-requests/${ok.body.requests[0].id}`, {
      body: { status: "confirmed" },
    });
    assert.equal(patchAnon.status, 401);
  });

  it("10b. 고객용 엔드포인트는 인증 없이 동작한다", async () => {
    const { status, body } = await create();
    assert.equal(status, 201);
    const read = await call("GET", `/api/booking-requests/${body.request.id}?email=traveler@example.com`);
    assert.equal(read.status, 200);
  });

  it("10c. 관리자 목록은 status로 걸러진다", async () => {
    await create({ email: "a@example.com" });
    const second = await create({ email: "b@example.com" });
    await call("PATCH", `/api/booking-requests/${second.body.request.id}`, {
      body: { status: "confirmed" },
      auth: authHeader(),
    });

    const requested = await call("GET", "/api/booking-requests?status=requested", { auth: authHeader() });
    assert.equal(requested.body.total, 1);
    assert.equal(requested.body.requests[0].email, "a@example.com");

    const both = await call("GET", "/api/booking-requests?status=requested,confirmed", { auth: authHeader() });
    assert.equal(both.body.total, 2);

    const bad = await call("GET", "/api/booking-requests?status=paid", { auth: authHeader() });
    assert.equal(bad.status, 400);
    assert.equal(bad.body.error.code, "BOOKING_INVALID_STATUS");
  });

  // --- 확인 11: 로그 --------------------------------------------------------
  it("11. 서버 로그에 이메일·이름이 남지 않는다", async () => {
    errorLogs = [];
    // 409(B8), 404, 400을 모두 거치게 한다.
    await create();
    await create();
    await call("GET", "/api/booking-requests/TS-00000000?email=traveler@example.com");
    await create({ email: "not-an-email" });

    const joined = errorLogs.join("\n");
    assert.equal(joined.includes("traveler@example.com"), false, `이메일이 로그에 남았다: ${joined}`);
    assert.equal(joined.includes("KIM JINHO"), false, `이름이 로그에 남았다: ${joined}`);
    // pg가 유니크 위반 시 detail에 이메일을 담으므로 detail이 새지 않았는지도 본다.
    assert.equal(joined.includes("already exists"), false, "pg detail이 로그에 들어갔다");
  });
});

// ---------------------------------------------------------------------------
// 자격증명이 없을 때 관리자 기능이 닫히는지 — 별도 app으로 확인한다(fail-closed).
// ---------------------------------------------------------------------------
describe("관리자 자격증명 미설정 (fail-closed)", suiteOpts, () => {
  let closedBase;
  let closedServer;

  before(async () => {
    process.env.DATABASE_URL = TEST_DB;
    delete process.env.ADMIN_USER;
    delete process.env.ADMIN_PASSWORD;

    const app = express();
    const mounted = mountBookingRequests(app);
    assert.equal(mounted.adminEnabled, false);
    closedServer = app.listen(0);
    await new Promise((r) => closedServer.once("listening", r));
    closedBase = `http://127.0.0.1:${closedServer.address().port}`;
  });

  after(async () => {
    await new Promise((r) => closedServer?.close(r) ?? r());
    process.env.ADMIN_USER = ADMIN.user;
    process.env.ADMIN_PASSWORD = ADMIN.password;
  });

  it("관리자 API와 /admin은 503으로 닫히고, 인증을 들고 가도 열리지 않는다", async () => {
    const list = await fetch(`${closedBase}/api/booking-requests`);
    assert.equal(list.status, 503);
    assert.equal((await list.json()).error.code, "ADMIN_DISABLED");

    const withAuth = await fetch(`${closedBase}/api/booking-requests`, {
      headers: { Authorization: "Basic " + Buffer.from("test-admin:test-password").toString("base64") },
    });
    assert.equal(withAuth.status, 503, "자격증명을 들고 와도 열리면 안 된다");

    const page = await fetch(`${closedBase}/admin/`);
    assert.equal(page.status, 503);
  });

  it("고객용 엔드포인트는 그대로 동작한다", async () => {
    const res = await fetch(`${closedBase}/api/booking-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRequest({ email: "still-works@example.com" })),
    });
    assert.equal(res.status, 201);
  });
});

if (skip) {
  it("예약 요청 API 통합 테스트를 건너뜀", () => {
    console.log(`\n⚠ 건너뜀: ${skip}\n`);
  });
}
