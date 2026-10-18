// 오류 코드·오류 응답 모양의 단일 출처는 docs/api/errors.md다. 코드를 추가·바꾸면 그 문서,
// 여기(booking.js·server.js가 공유하는 곳), 관련 테스트(server/errors-consistency.test.js)를
// 같이 고친다. 형식: 도메인_이유(대문자 스네이크). message는 디버그용/관리자 화면용이고,
// 고객용 다국어 화면은 code를 i18n 키로 변환해 쓴다(docs/conventions.md "오류 응답").
export const ERROR_CODES = {
  BOOKING_INVALID_FIELD: "BOOKING_INVALID_FIELD",
  BOOKING_INVALID_EMAIL: "BOOKING_INVALID_EMAIL",
  BOOKING_CONSENT_REQUIRED: "BOOKING_CONSENT_REQUIRED",
  BOOKING_EMAIL_REQUIRED: "BOOKING_EMAIL_REQUIRED",
  BOOKING_ACTIVE_REQUEST_EXISTS: "BOOKING_ACTIVE_REQUEST_EXISTS",
  BOOKING_NOT_FOUND: "BOOKING_NOT_FOUND",
  BOOKING_NOT_CANCELLABLE: "BOOKING_NOT_CANCELLABLE",
  BOOKING_INVALID_STATUS: "BOOKING_INVALID_STATUS",
  BOOKING_INVALID_TRANSITION: "BOOKING_INVALID_TRANSITION",
  BOOKING_DECLINE_REASON_REQUIRED: "BOOKING_DECLINE_REASON_REQUIRED",
  ADMIN_UNAUTHORIZED: "ADMIN_UNAUTHORIZED",
  ADMIN_DISABLED: "ADMIN_DISABLED",
  DATABASE_NOT_CONFIGURED: "DATABASE_NOT_CONFIGURED",
  SERVER_ERROR: "SERVER_ERROR",
  // 출국장 혼잡도(T1/T2, server.js /api/security-wait·/api/security-wait/t2) — 2026-10-18 추가.
  // T1/T2를 코드로 구분하지 않는다 — message가 어느 쪽인지 설명하고, code는 "무슨 일이 있었는지"만 말한다.
  CONGESTION_NOT_CONFIGURED: "CONGESTION_NOT_CONFIGURED",
  CONGESTION_INVALID_RESPONSE: "CONGESTION_INVALID_RESPONSE",
  CONGESTION_UPSTREAM_ERROR: "CONGESTION_UPSTREAM_ERROR",
  CONGESTION_UNREACHABLE: "CONGESTION_UNREACHABLE",
};

// 모양: { error: { code, message, ...extra } } — docs/conventions.md "오류 응답".
// 오류 본문에 이메일·이름 등 개인정보를 넣지 않는다(호출부 책임 — extra에 넣을 때 주의).
export const fail = (res, status, code, message, extra) =>
  res.status(status).json({ error: { code, message, ...extra } });
