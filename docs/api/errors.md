# 오류 코드 (단일 출처)

> 상태: 확정 · 최종 수정 2026-10-18
> 이 문서가 **오류 코드의 유일한 출처**다. 코드를 추가·변경·삭제할 때는 이 문서, 실제 서버 코드의
> 상수, 관련 테스트를 한 번에 고친다. 형식·설계 원칙은 [docs/conventions.md](../conventions.md) "오류 응답".

## 응답 모양
```json
{ "error": { "code": "BOOKING_ACTIVE_REQUEST_EXISTS", "message": "사람이 읽을 설명" } }
```
- `code`는 바뀌지 않는 식별자다. 프런트는 이걸로 분기하고, 고객용 다국어 화면은 **code를 i18n 키로 변환**해서 쓴다 — `message`를 화면에 그대로 띄우지 않는다.
- `message`는 디버그·로그·관리자 화면(`/admin`, 아직 다국어가 아님)에서만 그대로 쓴다. **이메일·이름 등 개인정보를 넣지 않는다.**
- 코드별로 더 줄 정보가 있으면 `error` 객체 **안에** 함께 넣는다(아래 "추가 필드" 열).

## 코드 목록

### 예약 요청 (`BOOKING_*`) — `server/booking.js`
| 코드 | HTTP | 언제 | 추가 필드 |
|---|---|---|---|
| `BOOKING_INVALID_FIELD` | 400 | 필수 필드 누락 또는 형식·타입 오류 (`roomId`/`mode`/`checkInMin`/`endMin`/`hours`/`price`/`priceSource`/`planIds`/`name`/`lang`/`consentVersion`) | — |
| `BOOKING_INVALID_EMAIL` | 400 | `email` 형식이 올바르지 않음 | — |
| `BOOKING_CONSENT_REQUIRED` | 400 | 동의 3개(`privacy`/`thirdParty`/`disclaimer`) 중 하나라도 `true`가 아님 | — |
| `BOOKING_EMAIL_REQUIRED` | 400 | 조회·취소 요청에 `email`이 없음 | — |
| `BOOKING_DECLINE_REASON_REQUIRED` | 400 | 관리자가 `declined`로 바꾸는데 `declineReason`이 없음 | — |
| `BOOKING_INVALID_STATUS` | 400 | 관리자 `PATCH`의 `status`가 5개 값 중 하나가 아님 | — |
| `BOOKING_NOT_FOUND` | 404 | 요청번호가 없거나 이메일이 일치하지 않음(두 경우를 구분하지 않음 — 존재 여부 노출 방지) | — |
| `BOOKING_ACTIVE_REQUEST_EXISTS` | 409 | B8 — 같은(정규화된) 이메일로 진행 중 요청이 이미 있음. 본문에 기존 요청 내용을 담지 않는다 | — |
| `BOOKING_NOT_CANCELLABLE` | 409 | `requested`가 아닌 요청을 사용자가 취소하려 함 | `status`(현재 상태) |
| `BOOKING_INVALID_TRANSITION` | 409 | 상태 표에서 허용하지 않는 전이를 시도 | `from`, `to` |

### 관리자 인증 (`ADMIN_*`) — `server/booking.js`
| 코드 | HTTP | 언제 | 추가 필드 |
|---|---|---|---|
| `ADMIN_UNAUTHORIZED` | 401 | 관리자 API에 HTTP Basic 인증이 없거나 틀림 | — |
| `ADMIN_DISABLED` | 503 | `ADMIN_USER`/`ADMIN_PASSWORD` 미설정 — 관리자 기능 전체가 fail-closed로 닫힘 | — |

### 서버 인프라 (`DATABASE_*`, `SERVER_*`)
| 코드 | HTTP | 언제 | 추가 필드 |
|---|---|---|---|
| `DATABASE_NOT_CONFIGURED` | 500 | `DATABASE_URL`이 설정되지 않음 | — |
| `SERVER_ERROR` | 500 | 그 외 서버 오류(DB 쿼리 실패 등) — 자세한 내용은 로그로만, 응답 `message`는 일반적 설명 | — |

## 이 목록을 쓰는 API
| API | 문서 |
|---|---|
| 예약 요청 | [api/booking-requests.md](booking-requests.md) |

다른 API가 생기면 이 문서에 섹션을 더하고, 그 API 문서에서 여기로 링크한다(booking-requests.md처럼).

## i18n 키 (제안 — 아직 프런트 연동 전)
프런트가 이 API를 호출하게 되면(지금은 메모리 저장소를 쓴다 — [STATUS](../STATUS.md)), 코드를 아래 패턴으로 번역 키에 매핑한다. 실제 `locales/*.json` 키는 그 작업에서 추가한다(미리 만들어두지 않음 — 안 쓰는 키가 쌓이는 것 방지).

```
errors.<code를 소문자 camelCase로>
예: BOOKING_ACTIVE_REQUEST_EXISTS → errors.bookingActiveRequestExists
```

## 변경 이력
| 날짜 | 내용 |
|---|---|
| 2026-10-18 | 최초 작성. `booking-requests.md`의 평평한 오류 코드(소문자 스네이크)를 여기로 분리하며 `도메인_이유` 대문자 스네이크로 변경 |
