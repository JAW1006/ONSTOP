-- 예약 요청 테이블 — 명세: docs/api/booking-requests.md, docs/design/screens/booking.md
-- ADR-0002(DB)가 제안 상태이므로 표준 PostgreSQL 기능만 쓴다(벤더 전용 확장 금지).

CREATE TABLE IF NOT EXISTS booking_requests (
  id               TEXT PRIMARY KEY,
  room_id          TEXT        NOT NULL,
  mode             TEXT        NOT NULL,
  -- 도착일 0시 기준 분. 자정을 넘기면 1440을 넘을 수 있다(A2) — 상한을 두지 않는다.
  check_in_min     INTEGER     NOT NULL,
  end_min          INTEGER     NOT NULL,
  hours            INTEGER,
  -- 예상 금액(원). 결제액이 아니다 — ADR-0004는 결제 없음.
  price            INTEGER,
  price_source     TEXT,
  -- 코스 장소 id만. 이름·좌표는 저장하지 않는다(카카오 응답 저장 금지 — operations/external-apis).
  plan_ids         TEXT[]      NOT NULL DEFAULT '{}',
  name             TEXT        NOT NULL,
  email            TEXT        NOT NULL,
  -- 소문자·공백 제거본. B8 판정과 조회 대조에만 쓴다.
  email_normalized TEXT        NOT NULL,
  lang             TEXT        NOT NULL,
  status           TEXT        NOT NULL DEFAULT 'requested',
  decline_reason   TEXT,
  -- 동의 3개(privacy·thirdParty·disclaimer)를 모두 받은 시각. 셋을 동시에 받으므로 시각은 하나다.
  consented_at     TIMESTAMPTZ NOT NULL,
  consent_version  TEXT        NOT NULL,
  -- 응답 기한. 기한 값이 정해지지 않아(인터뷰 2-2·2-6) 항상 NULL이고 자동 만료는 하지 않는다.
  expires_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT booking_requests_mode_valid
    CHECK (mode IN ('product', 'quote')),
  CONSTRAINT booking_requests_status_valid
    CHECK (status IN ('requested', 'confirmed', 'declined', 'expired', 'cancelled')),
  CONSTRAINT booking_requests_lang_valid
    CHECK (lang IN ('ko', 'en', 'zh', 'ja', 'vi')),
  CONSTRAINT booking_requests_price_source_valid
    CHECK (price_source IS NULL OR price_source IN ('hotel', 'demo')),
  -- 상품 요청은 블록 시간이 있어야 한다(모드 a). 견적 요청은 호텔이 정하므로 없어도 된다.
  CONSTRAINT booking_requests_product_needs_hours
    CHECK (mode <> 'product' OR hours IS NOT NULL),
  -- 거절은 사유가 있어야 한다 — 화면이 사유를 표시한다(screens/booking 5번).
  CONSTRAINT booking_requests_decline_needs_reason
    CHECK (status <> 'declined' OR decline_reason IS NOT NULL)
);

-- B8 "진행 중 요청 1건"을 DB에서 보장한다(2026-10-18 결정: 이메일 기준).
-- 애플리케이션 검사만으로는 동시 요청에 2건이 생길 수 있어서 부분 유니크 인덱스로 막는다.
CREATE UNIQUE INDEX IF NOT EXISTS booking_requests_one_active_per_email
  ON booking_requests (email_normalized)
  WHERE status IN ('requested', 'confirmed');

-- 관리자 목록(최신순).
CREATE INDEX IF NOT EXISTS booking_requests_created_at_desc
  ON booking_requests (created_at DESC);

-- 단건 조회는 요청번호(PK) + 이메일 대조 — 이메일 단독 조회용 인덱스.
CREATE INDEX IF NOT EXISTS booking_requests_email_normalized
  ON booking_requests (email_normalized);
