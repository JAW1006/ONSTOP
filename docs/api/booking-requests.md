# 예약 요청 API (자체 API)

> 상태: **확정 — 구현 완료** · 최종 수정 2026-10-18 · 테스트: 진짜 Postgres 통합 테스트 22개 통과(아래 "테스트")
> 이 문서는 **우리가 만드는 API**다. 같은 폴더의 다른 문서(외부 API 응답 기록)와 성격이 다르다.
> 화면 명세: [design/screens/booking](../design/screens/booking.md) — 필드·상태·B8의 **단일 출처는 그쪽**이다. 이 문서는 그것을 API 모양으로 옮긴 것이다.
> 관련 결정: [ADR-0002 DB](../decisions/ADR-0002-database.md)(제안 유지) · [ADR-0003 인증](../decisions/ADR-0003-auth.md)(비회원, 조회 OTP 미구현) · [ADR-0004 결제](../decisions/ADR-0004-payment.md)(결제 없음) · [ADR-0005 배포](../decisions/ADR-0005-environments-deploy.md)(운영 배포 금지)
> 코드: `server/booking.js` · 테이블: `server/migrations/001_booking_requests.sql` · 테스트: `server/booking.test.js`

## 목적과 범위
환승객이 보낸 데이유즈 **예약 요청을 저장·조회·취소**하고, 운영자가 호텔 회신(확정·거절)을 반영한다.

| 범위 | |
|---|---|
| 한다 | 요청 저장, 요청번호+이메일로 조회, 요청됨 취소, 관리자 목록·상태 변경 |
| **안 한다** | 결제([ADR-0004](../decisions/ADR-0004-payment.md) 결정 전) · 호텔에 요청 전달 · 이메일 발송 · 자동 만료 · 회원 인증 |

`src/features/booking/requests.tsx`의 `BookingRequestStore` 인터페이스(`requests` / `create` / `cancel`)를 그대로 대체하는 것이 목표다.

## ⚠ 운영 배포 금지 조건 (유지)
이 API가 생겨도 **운영 배포 금지는 그대로다.** 해제 조건은 [STATUS](../STATUS.md) "예약 요청 운영 기준" 5개 모두 충족이고, 이 API는 그중 4번의 일부(요청 저장)만 채운다.

| 기준 4 세부 | 이 API | 상태 |
|---|---|---|
| 요청 저장 | `POST /api/booking-requests` | 이 작업에서 구현 |
| 호텔 전달 | — | **미구현 — 이게 없으면 운영 배포 금지** |
| 회신 반영 | 관리자 `PATCH` (수기) | 이 작업에서 구현 |
| 이메일 발송 | — | 미구현 |

프런트의 데모 게이트(B6: `VITE_DEMO_MODE` 또는 개발 서버에서만 요청 버튼 동작)는 **그대로 둔다.** 서버가 생겼다고 운영 빌드에서 버튼을 열지 않는다.

## 인증
| 대상 | 방식 | 미설정 시 |
|---|---|---|
| 고객용 (`POST`, 단건 `GET`, 취소) | 없음(비회원). 단건 접근은 **요청번호 + 이메일 일치**로만 | — |
| 관리자용 (`GET` 목록, 상태 변경) | HTTP Basic (`ADMIN_USER` / `ADMIN_PASSWORD`) | **엔드포인트와 `/admin` 전체를 503으로 닫는다** (fail-closed) |

- 관리자 자격증명이 환경변수에 없으면 **실제 핸들러를 등록하지 않고** 503 스텁으로 대체한다. 인증 없이 관리자 기능이 열린 상태로 배포되는 경우를 구조적으로 막는다(코드 경로 자체가 없다).
- 입력 검증은 DB 확인보다 **먼저** 한다 — 잘못된 입력은 DB 설정 상태와 무관하게 `400`이다.
- 요청번호는 추측 방지를 위해 난수로 만든다(아래 `id`). 그래도 요청번호만으로는 접근할 수 없고 이메일이 함께 맞아야 한다.
- 이메일 OTP·비밀 링크([ADR-0003](../decisions/ADR-0003-auth.md))는 **미구현**이다. 지금의 "요청번호 + 이메일"은 그 전 단계의 최소 방어이고, 이메일 발송이 생기면 OTP로 올린다.

## 요청 레코드 ↔ DB 컬럼
[booking.md "요청 레코드"](../design/screens/booking.md) 기준. 테이블은 `booking_requests`.

| API 필드 | DB 컬럼 | 형식 | 필수 | 의미 |
|---|---|---|---|---|
| `id` | `id` | `TEXT` PK — `TS-` + 8자(Crockford base32) | 서버 생성 | 요청번호. 사용자·호텔에 보여주는 값 |
| `roomId` | `room_id` | `TEXT` | ✓ | 숙소 id |
| `mode` | `mode` | `TEXT` — `product` \| `quote` | ✓ | 상품 요청 / 견적 요청 |
| `checkInMin` | `check_in_min` | `INTEGER` | ✓ | 체크인 슬롯(도착일 0시 기준 분) |
| `endMin` | `end_min` | `INTEGER` | ✓ | 이용 종료. 상품=슬롯+상품시간, 견적=숙소 출발 기한 |
| `hours` | `hours` | `INTEGER` null 허용 | 모드 a | 상품 블록 시간 |
| `price` | `price` | `INTEGER` null 허용 | 모드 a | 예상 금액(원). **결제액 아님** |
| `priceSource` | `price_source` | `TEXT` — `hotel` \| `demo` null 허용 | 모드 a | 가격표 출처(A9) |
| `planIds` | `plan_ids` | `TEXT[]` 기본 `{}` | ✓(빈 배열 허용) | 코스 장소 id. **이름·좌표는 저장하지 않는다** |
| `name` | `name` | `TEXT` | ✓ | 이름(로마자 허용, 문자 제한 없음) |
| `email` | `email` | `TEXT` | ✓ | 회신받을 이메일 |
| — | `email_normalized` | `TEXT` | 서버 생성 | 소문자+공백 제거. **B8 판정과 조회 대조에만** 쓴다 |
| `lang` | `lang` | `TEXT` — `ko` \| `en` \| `zh` \| `ja` \| `vi` | ✓ | 회신·이메일 언어 |
| `status` | `status` | `TEXT` | 서버 기본 `requested` | 아래 상태 표 |
| `declineReason` | `decline_reason` | `TEXT` null 허용 | 거절 시 | 호텔이 준 사유 |
| `consentedAt` | `consented_at` | `TIMESTAMPTZ` | ✓ | 동의 3개를 모두 받은 시각 |
| `consentVersion` | `consent_version` | `TEXT` | ✓ | 동의 문구 버전. legal 확인 후 문구가 바뀌면 올린다 |
| `expiresAt` | `expires_at` | `TIMESTAMPTZ` null 허용 | — | 응답 기한. **값 미정이라 항상 null, 자동 만료 안 함** |
| `createdAt` | `created_at` | `TIMESTAMPTZ` 기본 `now()` | 서버 생성 | |
| — | `updated_at` | `TIMESTAMPTZ` | 서버 | 상태 변경 시각 |

**받지 않는 항목**(B4 최소 수집): 전화번호 · 여권 · 국적 · 생년월일. 레거시 폼의 전화번호는 쓰지 않는다.

### 동의 (3개 모두 필수)
`consent` 객체로 받고, 셋 다 `true`가 아니면 400이다. 개별 시각은 남기지 않는다(동시에 받으므로).

| 키 | 내용 | legal |
|---|---|---|
| `privacy` | 개인정보 수집·이용(이름·이메일 / 목적: 요청 전달·회신) | [2-1](../legal-checklist.md) |
| `thirdParty` | 호텔에 이름·이메일 제공(제3자 제공) | [7-6](../legal-checklist.md) |
| `disclaimer` | 계산은 참고용, 입국·탑승 책임은 이용자 | [0-2](../legal-checklist.md) |

### 상태
| 값 | 뜻 | 다음 상태 | 누가 |
|---|---|---|---|
| `requested` | 호텔 확인 중(기본값) | `confirmed` `declined` `cancelled` `expired` | |
| `confirmed` | 호텔이 확인 | `cancelled` | 관리자만 (앱에 취소 버튼 없음 — 호텔 문의) |
| `declined` | 호텔이 거절 (`declineReason`) | 없음(종료) | 관리자 |
| `expired` | 응답 기한 경과 | 없음(종료) | 관리자 수기 (자동 만료 미구현) |
| `cancelled` | 사용자 또는 관리자가 취소 | 없음(종료) | |

**진행 중(active)** = `requested` 또는 `confirmed`. `isActive`와 같은 정의.

### B8 — 진행 중 요청 1건 (2026-10-18 결정)
**정규화된 이메일(`email_normalized`) 기준**으로 진행 중 요청이 있으면 새 요청을 받지 않는다(`409`).

| 항목 | 내용 |
|---|---|
| 판정 키 | `email_normalized` — 숙소와 무관하게 1건 |
| 걸리면 | `409 active_request_exists`. **응답 본문에 기존 요청 내용을 담지 않는다**(요청번호·숙소·시각 모두 없음) |
| 화면 | "진행 중인 요청이 있어요" + `/bookings` 링크 (booking.md 진입/이탈) |
| 보장 | 부분 유니크 인덱스로 DB에서 막는다 — 동시 요청에도 2건이 생기지 않는다 |
| 한계 | 다른 이메일을 쓰면 우회된다. 남의 이메일로 POST하면 **진행 중 요청의 존재 여부**는 알 수 있다(내용은 아님) — 받아들인 위험, 이메일 발송이 생기면 재검토 |

## 엔드포인트

### `POST /api/booking-requests` — 요청 생성
```json
{
  "roomId": "hotel-aura",
  "mode": "product",
  "checkInMin": 750,
  "endMin": 930,
  "hours": 3,
  "price": 50000,
  "priceSource": "demo",
  "planIds": ["spot-12", "spot-07"],
  "name": "KIM JINHO",
  "email": "someone@example.com",
  "lang": "ko",
  "consent": { "privacy": true, "thirdParty": true, "disclaimer": true },
  "consentVersion": "2026-10-18-draft"
}
```
`201`:
```json
{ "request": { "id": "TS-4K7M2QPX", "status": "requested", "createdAt": "2026-10-18T05:12:33.120Z", "...": "요청 필드 그대로(consent는 consentedAt으로)" } }
```

| 검사 | 아니면 |
|---|---|
| `roomId` `mode` `checkInMin` `endMin` `name` `email` `lang` 존재, 타입 맞음 | `400 invalid_field` |
| `mode`가 `product`면 `hours` 필요 | `400 invalid_field` |
| `email` 형식 | `400 invalid_email` |
| `consent` 3개 모두 `true` | `400 consent_required` |
| 진행 중 요청 없음(B8) | `409 active_request_exists` |

- 금액·시각은 **검증하지 않고 받은 그대로 저장**한다. 계산의 단일 출처는 `src/domain`이고 서버는 그 결과를 보관만 한다. 서버가 다시 계산하면 두 곳이 갈라진다.
- `endMin`은 자정을 넘으면 1440을 넘는 값이 올 수 있다(A2). 상한을 두지 않는다.

### `GET /api/booking-requests/:id?email=` — 단건 조회
요청번호와 이메일이 **둘 다** 맞아야 한다.

`200`: `{ "request": { ... } }`

| 상황 | 응답 |
|---|---|
| `email` 없음 | `400 email_required` |
| 요청번호 없음 **또는** 이메일 불일치 | `404 not_found` — **두 경우를 구분하지 않는다**(요청번호 존재 여부 노출 방지) |

### `POST /api/booking-requests/:id/cancel` — 사용자 취소
```json
{ "email": "someone@example.com" }
```
`200`: `{ "request": { ..., "status": "cancelled" } }`

| 상황 | 응답 |
|---|---|
| 요청번호 없음 또는 이메일 불일치 | `404 not_found` |
| `status`가 `requested`가 아님 | `409 not_cancellable` + `status` |
| 이미 `cancelled` | `409 not_cancellable` (멱등 아님 — 화면이 상태를 먼저 본다) |

`confirmed`는 앱에서 취소할 수 없다(booking.md 4번 — 호텔 연락처·취소 규정 표시). `DELETE`를 쓰지 않는 이유: 레코드를 지우지 않고 상태만 바꾼다.

### `GET /api/booking-requests` — 관리자 목록
Basic 인증 필요. 최신순.

`?status=requested` 로 걸러낼 수 있다(여러 개는 쉼표).

`200`: `{ "requests": [ { ... } ], "total": 12 }`

### `PATCH /api/booking-requests/:id` — 관리자 상태 변경
Basic 인증 필요. 호텔에 전화·메일로 확인한 결과를 수기로 반영한다.

```json
{ "status": "declined", "declineReason": "해당 시간대 만실" }
```

| 검사 | 아니면 |
|---|---|
| `status`가 5개 중 하나 | `400 invalid_status` |
| 위 상태 표의 전이 허용 | `409 invalid_transition` + `from`, `to` |
| `declined`면 `declineReason` 필요 | `400 decline_reason_required` |

## 에러 형식
```json
{ "error": "active_request_exists", "message": "사람이 읽을 설명" }
```
`message`에 **이메일·이름을 넣지 않는다.**

| 코드 | 언제 |
|---|---|
| `400` | 필드 누락·형식 오류·동의 누락 |
| `401` | 관리자 Basic 인증 실패 |
| `404` | 요청번호 없음 또는 이메일 불일치 |
| `409` | B8 위반, 취소 불가 상태, 허용되지 않는 전이 |
| `500` | `DATABASE_URL` 미설정(`database_not_configured`), 그 외 서버 오류 |
| `503` | 관리자 자격증명 미설정으로 관리자 기능이 닫혀 있음 |

## 개인정보
| 항목 | 규칙 |
|---|---|
| 로그 | **이메일·이름을 로그에 쓰지 않는다.** 식별이 필요하면 요청번호(`id`)만 남긴다. 오류 로그도 같다 |
| 저장 위치 | 해외 리전일 수 있다 → 국외 이전 고지·동의는 [legal 2-4](../legal-checklist.md) 확인 전 |
| 보관 기간·파기 | **정하지 않았다.** [legal 2-1](../legal-checklist.md)(수집 항목·목적·보관 기간)에서 확인 후 정한다. 그때까지 자동 삭제 작업을 만들지 않는다 |
| 제3자 제공 | 호텔에 이름·이메일을 준다 → [legal 7-6](../legal-checklist.md) |
| 수집 최소화 | 위 "받지 않는 항목" 유지 |

## 테이블 관리
스키마는 코드가 아니라 **SQL 파일**로 관리한다. 서버 시작 시 `server/migrations/*.sql`을 이름순으로 적용하고, 적용한 파일명을 `schema_migrations`에 남겨 다시 돌리지 않는다.

| 파일 | 내용 |
|---|---|
| `001_booking_requests.sql` | `booking_requests` 테이블 + B8 부분 유니크 인덱스 + 조회 인덱스 |

- 되돌리는 SQL(down)은 두지 않는다. 바꿀 때는 새 번호 파일을 더한다.
- ADR-0002가 제안 상태이므로 **표준 Postgres만** 쓴다(벤더 전용 기능·확장 금지). DB를 옮겨도 같은 파일이 돌아야 한다.

## 미구현 / 의존
| # | 내용 | 막는 것 |
|---|---|---|
| 1 | **호텔에 요청 전달** (이메일·관리 화면 등 — 인터뷰 2장 결과) | **운영 배포** |
| 2 | 이메일 발송(접수·확정·거절 알림) | 사용자가 회신을 못 받음 |
| 3 | 이메일 OTP·비밀 링크 조회([ADR-0003](../decisions/ADR-0003-auth.md)) | 지금은 요청번호+이메일 |
| 4 | 자동 만료 — 기한 값은 호텔 응답 속도로 정함(인터뷰 2-2·2-6) | `expired`는 수기만 |
| 5 | 보관 기간·파기([legal 2-1](../legal-checklist.md)) | 삭제 작업 |
| 6 | 프런트 교체 — `BookingRequestStore`를 이 API로 | 지금은 메모리(데모) |

## 테스트
`server/booking.test.js` — **진짜 PostgreSQL**에 붙는 통합 테스트 22개(모의 DB 아님).

| 명령 | 내용 |
|---|---|
| `cd server && npm test` | docker compose로 일회용 Postgres(5433, tmpfs)를 띄우고 실행 후 자동 정리 |
| `cd server && npm run test:nodb` | Docker 없을 때 — 통합 테스트는 건너뛴다(건너뛴 사실을 출력) |
| CI | `.github/workflows/ci.yml`의 `server` 잡이 Postgres 서비스 컨테이너로 실행. 건너뛰면 **CI 실패** |

이 테스트는 `booking_requests`를 TRUNCATE하므로 가드가 3중이다: `TEST_DATABASE_URL`이 없으면 건너뜀,
`DATABASE_URL`과 같으면 중단, 호스트가 로컬이 아니면 중단(`ALLOW_REMOTE_TEST_DB=1`로만 우회).

덮는 범위는 [STATUS](../STATUS.md) "예약 요청 API 테스트"에 있다. 남은 수동 확인은 `/admin` 화면 조작뿐이다.

## 변경 이력
| 날짜 | 내용 |
|---|---|
| 2026-10-18 | 최초 작성. B8을 이메일 기준으로 결정, 관리자 Basic 인증 + fail-closed, 마이그레이션 SQL 파일 방식 |
| 2026-10-18 | 진짜 Postgres 통합 테스트 22개 추가(일회용 컨테이너 + CI 서비스 컨테이너). 입력 검증을 DB 확인보다 먼저 하도록 정리 |
