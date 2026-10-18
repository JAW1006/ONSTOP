// 예약 요청 API — 결제 없이 요청만 받고(ADR-0004), 호텔 회신은 관리자가 수기로 반영한다.
//
// 명세(단일 출처): docs/api/booking-requests.md · 화면: docs/design/screens/booking.md
// 테이블: migrations/*.sql — 스키마를 이 파일에서 만들지 않는다.
//
// ⚠ 운영 배포 금지: 요청이 실제로 호텔에 전달되고 회신을 받기 전까지 prod에 배포하지 않는다
//   (docs/STATUS.md "운영 배포 금지", ADR-0005). 이 파일은 그 조건 중 "요청 저장"만 채운다.
//   프런트의 데모 게이트(B6)는 그대로 둔다 — 서버가 생겼다고 운영 빌드에서 요청 버튼을 열지 않는다.
import crypto from "crypto";
import express from "express";
import fs from "fs/promises";
import nodePath from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = nodePath.dirname(fileURLToPath(import.meta.url));

const STATUSES = ["requested", "confirmed", "declined", "expired", "cancelled"];
const MODES = ["product", "quote"];
const LANGS = ["ko", "en", "zh", "ja", "vi"];
const PRICE_SOURCES = ["hotel", "demo"];

// 허용 전이 — docs/api/booking-requests.md "상태" 표. 종료 상태에서는 더 바뀌지 않는다.
// confirmed → cancelled는 관리자만(앱에는 취소 버튼이 없고 "호텔에 문의"로 안내한다).
const TRANSITIONS = {
  requested: ["confirmed", "declined", "expired", "cancelled"],
  confirmed: ["cancelled"],
  declined: [],
  expired: [],
  cancelled: [],
};

// Crockford base32 — I·L·O·U를 빼서 호텔과 전화로 요청번호를 주고받을 때 헷갈리지 않게.
// 32가 256을 나누므로 바이트 → 글자 변환에 모듈로 편향이 없다.
const ID_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const ID_LENGTH = 8;

function newRequestId() {
  const bytes = crypto.randomBytes(ID_LENGTH);
  let out = "";
  for (let i = 0; i < ID_LENGTH; i += 1) out += ID_ALPHABET[bytes[i] % ID_ALPHABET.length];
  return `TS-${out}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeEmail = (value) => String(value).trim().toLowerCase();
const trimmed = (value) => (typeof value === "string" ? value.trim() : "");

// 개인정보 보호 — 로그에 이메일·이름을 쓰지 않는다(docs/api/booking-requests.md "개인정보").
// pg는 유니크 위반 시 err.detail에 위반한 값(= 이메일)을 그대로 담으므로 detail은 절대 넣지 않는다.
function logError(what, err) {
  console.error(`[booking] ${what} failed`, { code: err.code, constraint: err.constraint, message: err.message });
}

// 오류 본문에도 이메일·이름을 넣지 않는다.
const fail = (res, status, error, message, extra) => res.status(status).json({ error, message, ...extra });

function rowToRequest(row) {
  return {
    id: row.id,
    roomId: row.room_id,
    mode: row.mode,
    checkInMin: row.check_in_min,
    endMin: row.end_min,
    hours: row.hours,
    price: row.price,
    priceSource: row.price_source,
    planIds: row.plan_ids ?? [],
    name: row.name,
    email: row.email,
    lang: row.lang,
    status: row.status,
    declineReason: row.decline_reason,
    consentedAt: row.consented_at.toISOString(),
    consentVersion: row.consent_version,
    expiresAt: row.expires_at ? row.expires_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
  // email_normalized는 내부 판정용이라 응답에 넣지 않는다.
}

// 금액·시각은 검증하지 않고 받은 그대로 저장한다 — 계산의 단일 출처는 src/domain이고,
// 서버가 다시 계산하면 두 곳이 갈라진다(docs/api/booking-requests.md POST 설명).
function parseNewRequest(body) {
  const b = body || {};
  const bad = (error, message) => ({ error, message });

  const roomId = trimmed(b.roomId);
  if (!roomId) return bad("invalid_field", "roomId is required");
  if (!MODES.includes(b.mode)) return bad("invalid_field", `mode must be one of ${MODES.join(", ")}`);
  if (!Number.isInteger(b.checkInMin)) return bad("invalid_field", "checkInMin must be an integer");
  if (!Number.isInteger(b.endMin)) return bad("invalid_field", "endMin must be an integer");

  const hours = b.hours ?? null;
  if (hours !== null && !Number.isInteger(hours)) return bad("invalid_field", "hours must be an integer");
  if (b.mode === "product" && hours === null) return bad("invalid_field", "hours is required when mode is product");

  const price = b.price ?? null;
  if (price !== null && !Number.isInteger(price)) return bad("invalid_field", "price must be an integer");

  const priceSource = b.priceSource ?? null;
  if (priceSource !== null && !PRICE_SOURCES.includes(priceSource)) {
    return bad("invalid_field", `priceSource must be one of ${PRICE_SOURCES.join(", ")}`);
  }

  const planIds = b.planIds ?? [];
  if (!Array.isArray(planIds) || planIds.some((id) => !trimmed(id))) {
    return bad("invalid_field", "planIds must be an array of non-empty strings");
  }

  // 이름은 로마자 표기를 권장하지만 문자 종류를 제한하지 않는다(B4).
  const name = trimmed(b.name);
  if (!name) return bad("invalid_field", "name is required");

  const email = trimmed(b.email);
  if (!EMAIL_RE.test(email)) return bad("invalid_email", "email format is not valid");

  if (!LANGS.includes(b.lang)) return bad("invalid_field", `lang must be one of ${LANGS.join(", ")}`);

  // 동의 3개는 모두 필수다 — 하나라도 빠지면 요청을 만들지 않는다(legal 2-1·7-6·0-2).
  const consent = b.consent || {};
  if (consent.privacy !== true || consent.thirdParty !== true || consent.disclaimer !== true) {
    return bad("consent_required", "privacy, thirdParty and disclaimer consents are all required");
  }
  const consentVersion = trimmed(b.consentVersion);
  if (!consentVersion) return bad("invalid_field", "consentVersion is required");

  return {
    value: {
      roomId,
      mode: b.mode,
      checkInMin: b.checkInMin,
      endMin: b.endMin,
      hours,
      price,
      priceSource,
      planIds: planIds.map((id) => trimmed(id)),
      name,
      email,
      lang: b.lang,
      consentVersion,
    },
  };
}

// 관리형 Postgres(Render·Supabase 등)는 자체 서명 체인을 쓰는 경우가 많아 검증을 끈다.
// DB 호스트가 확정되면(ADR-0002) CA 번들을 지정하는 쪽으로 바꾼다.
function sslFor(url) {
  if (/@(localhost|127\.0\.0\.1)([:/]|$)/.test(url)) return false;
  return { rejectUnauthorized: false };
}

// 스키마는 migrations/*.sql이 유일한 출처다. 이름순으로 적용하고 적용분은 schema_migrations에 남긴다.
async function runMigrations(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const dir = nodePath.join(__dirname, "migrations");
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  const { rows } = await pool.query("SELECT filename FROM schema_migrations");
  const applied = new Set(rows.map((r) => r.filename));

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await fs.readFile(nodePath.join(dir, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`[booking] applied migration ${file}`);
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      throw new Error(`migration ${file} failed: ${err.message}`);
    } finally {
      client.release();
    }
  }
}

function basicAuth(user, password) {
  const expected = Buffer.from(`${user}:${password}`);
  return (req, res, next) => {
    const [scheme, encoded] = (req.get("authorization") || "").split(" ");
    if (scheme === "Basic" && encoded) {
      const got = Buffer.from(Buffer.from(encoded, "base64").toString("utf8"));
      // timingSafeEqual은 길이가 다르면 던지므로 길이를 먼저 본다.
      if (got.length === expected.length && crypto.timingSafeEqual(got, expected)) return next();
    }
    res.set("WWW-Authenticate", 'Basic realm="TimeStay admin", charset="UTF-8"');
    return fail(res, 401, "unauthorized", "admin credentials are required");
  };
}

/**
 * 예약 요청 라우트와 관리자 페이지를 app에 붙인다.
 * server.js는 이 함수를 부르고 init()만 기다린다 — 연결 코드를 최소로 둔다.
 */
export function mountBookingRequests(app) {
  const databaseUrl = process.env.DATABASE_URL;
  const adminUser = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminEnabled = Boolean(adminUser && adminPassword);

  const json = express.json({ limit: "16kb" });
  const pool = databaseUrl ? new pg.Pool({ connectionString: databaseUrl, ssl: sslFor(databaseUrl) }) : null;
  // 유휴 클라이언트 오류로 프로세스가 죽지 않게 한다(다른 API는 계속 동작해야 한다).
  if (pool) pool.on("error", (err) => logError("idle database client", err));

  // DATABASE_URL이 없으면 라우트는 붙이되 500으로 답한다 — 화면이 "보내지 못했어요"를 그대로 보여준다.
  const noDatabase = (res) => {
    if (pool) return false;
    fail(res, 500, "database_not_configured", "DATABASE_URL is not configured on the server");
    return true;
  };

  // 관리자 자격증명이 없으면 **실제 핸들러를 등록하지 않고** 503 스텁으로 대체한다.
  // 인증 없이 관리자 기능이 열린 채 배포되는 경우를 구조적으로 막는다(fail-closed).
  const adminClosed = (_req, res) =>
    fail(res, 503, "admin_disabled", "admin access is not configured on this server");
  const requireAdmin = adminEnabled ? basicAuth(adminUser, adminPassword) : null;

  // --- 고객용 ---------------------------------------------------------------

  // 입력 검증을 DB 확인보다 먼저 한다 — 잘못된 입력은 DB 상태와 무관하게 400이어야 한다.
  app.post("/api/booking-requests", json, async (req, res) => {
    const parsed = parseNewRequest(req.body);
    if (parsed.error) return fail(res, 400, parsed.error, parsed.message);
    if (noDatabase(res)) return;
    const v = parsed.value;

    try {
      const { rows } = await pool.query(
        `INSERT INTO booking_requests
           (id, room_id, mode, check_in_min, end_min, hours, price, price_source, plan_ids,
            name, email, email_normalized, lang, consented_at, consent_version)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, now(), $14)
         RETURNING *`,
        [newRequestId(), v.roomId, v.mode, v.checkInMin, v.endMin, v.hours, v.price, v.priceSource,
          v.planIds, v.name, v.email, normalizeEmail(v.email), v.lang, v.consentVersion],
      );
      return res.status(201).json({ request: rowToRequest(rows[0]) });
    } catch (err) {
      // B8 — 부분 유니크 인덱스에 걸린 경우. 응답에 기존 요청 내용을 담지 않는다(존재 여부만).
      if (err.code === "23505" && err.constraint === "booking_requests_one_active_per_email") {
        return fail(res, 409, "active_request_exists", "there is already an active booking request for this contact");
      }
      logError("create booking request", err);
      return fail(res, 500, "server_error", "failed to save the booking request");
    }
  });

  app.get("/api/booking-requests/:id", async (req, res) => {
    const email = trimmed(req.query.email);
    if (!email) return fail(res, 400, "email_required", "email query parameter is required");
    if (noDatabase(res)) return;

    try {
      const { rows } = await pool.query(
        "SELECT * FROM booking_requests WHERE id = $1 AND email_normalized = $2",
        [req.params.id, normalizeEmail(email)],
      );
      // 요청번호가 없는 경우와 이메일이 틀린 경우를 구분하지 않는다 — 요청번호 존재 여부가 드러나지 않게.
      if (!rows.length) return fail(res, 404, "not_found", "no booking request matches that number and contact");
      return res.json({ request: rowToRequest(rows[0]) });
    } catch (err) {
      logError("read booking request", err);
      return fail(res, 500, "server_error", "failed to read the booking request");
    }
  });

  // 레코드를 지우지 않고 상태만 바꾸므로 DELETE가 아니다.
  app.post("/api/booking-requests/:id/cancel", json, async (req, res) => {
    const email = trimmed(req.body?.email);
    if (!email) return fail(res, 400, "email_required", "email is required");
    if (noDatabase(res)) return;

    try {
      // status='requested' 조건을 UPDATE에 그대로 넣어, 동시에 호텔 회신이 반영되는 경우를 막는다.
      const { rows } = await pool.query(
        `UPDATE booking_requests SET status = 'cancelled', updated_at = now()
         WHERE id = $1 AND email_normalized = $2 AND status = 'requested'
         RETURNING *`,
        [req.params.id, normalizeEmail(email)],
      );
      if (rows.length) return res.json({ request: rowToRequest(rows[0]) });

      // 안 바뀌었으면 "없음"인지 "취소할 수 없는 상태"인지 가려서 알려준다.
      const found = await pool.query(
        "SELECT status FROM booking_requests WHERE id = $1 AND email_normalized = $2",
        [req.params.id, normalizeEmail(email)],
      );
      if (!found.rows.length) return fail(res, 404, "not_found", "no booking request matches that number and contact");
      return fail(res, 409, "not_cancellable", "only a requested booking can be cancelled in the app", {
        status: found.rows[0].status,
      });
    } catch (err) {
      logError("cancel booking request", err);
      return fail(res, 500, "server_error", "failed to cancel the booking request");
    }
  });

  // --- 관리자용 -------------------------------------------------------------

  if (!adminEnabled) {
    app.get("/api/booking-requests", adminClosed);
    app.patch("/api/booking-requests/:id", adminClosed);
    app.use("/admin", adminClosed);
  } else {
    app.get("/api/booking-requests", requireAdmin, async (req, res) => {
      const wanted = trimmed(req.query.status)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (wanted.some((s) => !STATUSES.includes(s))) {
        return fail(res, 400, "invalid_status", `status must be one of ${STATUSES.join(", ")}`);
      }
      if (noDatabase(res)) return;

      try {
        const { rows } = await pool.query(
          `SELECT * FROM booking_requests ${wanted.length ? "WHERE status = ANY($1)" : ""} ORDER BY created_at DESC`,
          wanted.length ? [wanted] : [],
        );
        return res.json({ requests: rows.map(rowToRequest), total: rows.length });
      } catch (err) {
        logError("list booking requests", err);
        return fail(res, 500, "server_error", "failed to list booking requests");
      }
    });

    // 호텔에 전화·메일로 확인한 결과를 수기로 반영한다.
    app.patch("/api/booking-requests/:id", requireAdmin, json, async (req, res) => {
      const { status } = req.body || {};
      if (!STATUSES.includes(status)) {
        return fail(res, 400, "invalid_status", `status must be one of ${STATUSES.join(", ")}`);
      }
      const reason = trimmed(req.body?.declineReason);
      if (status === "declined" && !reason) {
        return fail(res, 400, "decline_reason_required", "declineReason is required when declining");
      }
      if (noDatabase(res)) return;

      try {
        const found = await pool.query("SELECT status FROM booking_requests WHERE id = $1", [req.params.id]);
        if (!found.rows.length) return fail(res, 404, "not_found", "no booking request with that number");
        const from = found.rows[0].status;
        if (!TRANSITIONS[from].includes(status)) {
          return fail(res, 409, "invalid_transition", "that status change is not allowed", { from, to: status });
        }

        // from을 WHERE에 넣어, 읽은 뒤 다른 요청이 상태를 바꾼 경우에는 덮어쓰지 않는다.
        const { rows } = await pool.query(
          `UPDATE booking_requests
              SET status = $1,
                  decline_reason = CASE WHEN $1 = 'declined' THEN $2 ELSE decline_reason END,
                  updated_at = now()
            WHERE id = $3 AND status = $4
            RETURNING *`,
          [status, reason || null, req.params.id, from],
        );
        if (!rows.length) {
          return fail(res, 409, "invalid_transition", "the request status changed while processing");
        }
        return res.json({ request: rowToRequest(rows[0]) });
      } catch (err) {
        logError("update booking request", err);
        return fail(res, 500, "server_error", "failed to update the booking request");
      }
    });

    // 예약 요청을 사람이 보기 편하게 확인하는 내부용 페이지 — 고객용 앱과 분리하고 인증 뒤에 둔다.
    app.use("/admin", requireAdmin, express.static(nodePath.join(__dirname, "admin")));
  }

  return {
    databaseConfigured: Boolean(pool),
    adminEnabled,
    async init() {
      if (pool) await runMigrations(pool);
    },
  };
}
