# 코딩 컨벤션

> 상태: 확정 · 최종 수정 2026-10-19
> **코드를 쓰기 전에 이 문서를 먼저 읽는다**([AGENTS.md](../AGENTS.md) 1장, [CLAUDE.md](../CLAUDE.md)).
> 여기 없는 이름 규칙은 그 폴더·파일에서 **이미 쓰이고 있는 방식**을 따른다 — 새 패턴을 만들지 않는다.
> 기존 코드를 이 문서에 맞춰 한꺼번에 고치는 작업은 하지 않는다. 새로 쓰는 코드부터 적용하고,
> 어긋나는 기존 코드는 [STATUS.md](STATUS.md) "컨벤션 불일치" 표에 쌓아 둔다.

## 1. 폴더
소문자, 여러 단어는 하이픈. 예: `src/features/time-safe/`, `src/components/ui/`.

## 2. 파일
| 무엇 | 규칙 | 예 |
|---|---|---|
| 화면·컴포넌트 (`.tsx`, JSX를 그리는 파일) | PascalCase | `HomeScreen.tsx`, `RoomCard.tsx`, `TimeSafeCard.tsx` |
| 계산·유틸·API 호출·훅·컨텍스트 (컴포넌트를 그리지 않는 `.ts`/`.tsx`) | kebab-case | `time-fit.ts`, `use-course.ts`, `app-mode.tsx`, `trip-state.tsx` |
| shadcn/ui 기반 공통 컴포넌트(`src/components/ui/`) | kebab-case (이 폴더만 예외) | `bottom-sheet.tsx`, `page-header.tsx` |
| 테스트 | 대상 파일명 + `.test.ts`(`.tsx`) 그대로, 같은 폴더 | `HomeScreen.test.tsx`, `time-fit.test.ts` |

`app-mode.tsx`·`trip-state.tsx`처럼 **파일 확장자가 `.tsx`여도** 주된 내용이 컴포넌트가 아니라 컨텍스트·훅·상태면 kebab-case를 쓴다. 그 안에 `TripProvider` 같은 컴포넌트를 함께 export해도 파일명은 그대로 둔다 — 파일명은 "그 파일의 주된 역할"을 따른다. `src/components/ui/`는 vendored shadcn/ui 컨벤션을 그대로 쓰는 예외 폴더다.

## 3. 컴포넌트·함수·타입 이름
| 무엇 | 규칙 | 예 |
|---|---|---|
| 컴포넌트 | PascalCase, named export(`export function X()`) — default export 안 씀 | `export function RoomCard(...)` |
| 일반 함수 | camelCase, **동사로 시작** | `parseFlightDateTime`, `buildCourseTimeline`, `resolveConnection` |
| 훅 | camelCase, `use` 접두사 | `useCourseModel`, `useAppMode`, `useTrip` |
| 불리언을 반환하는 함수·변수 | `is`/`has`/`can` 접두사 | `isCheckoutPastReturn`, `canGoOut` |
| 콜백 prop | `on` 접두사 | `onBack`, `onCancel`, `onSelectLeg` |
| interface·type | PascalCase, 명사 | `BookingRequest`, `TravelMode`, `CourseStop` |

### 예외 — 값을 반환하는 순수 계산 함수
`src/domain/`의 계산 함수 다수가 동사로 시작하지 않고 **반환값 자체를 이름**으로 쓴다 — `courseAvailableMin`, `courseUsedMin`, `securityBufferMin`, `walkMin`, `averageSecurityWaitMin`. 이건 어긋난 게 아니라 **허용된 패턴**이다: 부수효과 없이 분·km 같은 단위값 하나를 돌려주는 순수 계산 함수는 "그 값의 이름"으로 지어도 된다. 상태를 바꾸거나 fetch처럼 동작을 하는 함수는 계속 동사로 시작한다(`fetchDeparture`, `buildCourseTimeline`).

### 참고 — 아직 정리 안 된 기존 패턴
아래는 지금 코드에 있는 패턴이고, 이 문서가 금지하지는 않지만 새로 쓸 때는 되도록 피한다. 기존 코드는 고치지 않는다.
- 불리언 반환인데 `is`/`has`/`can`이 없는 함수: `fitsBudget`, `fitsSequential`, `wouldFit`, `wouldFitSequential`, `productStartsAt`(`time-fit.ts`, `dayuse-pricing.ts`). 영어로 자연스럽게 읽히는 서술형이라 당장 바꾸진 않지만, 새로 만들 불리언 함수는 `is`/`has`/`can`을 기본으로 한다.

## 4. 상수·변수의 단위 접미사
### 상수 (`src/domain/constants.ts`)
대문자 스네이크 + 단위 접미사. 이미 전부 이 규칙을 따른다.

| 접미사 | 단위 | 예 |
|---|---|---|
| `_MIN` | 분 | `ARRIVAL_IMMIGRATION_MIN`, `GATE_MARGIN_MIN` |
| `_MS` | 밀리초 | `FLIGHT_POLL_INTERVAL_MS` |
| `_KM`, `_KMH` | km, km/h | `WALK_MAX_KM`, `WALK_SPEED_KMH` |
| `_KRW` | 원 | `TIER_PRICE_ROUND_KRW`, `CPC_MIN_KRW` |
| `_RATE`, `_RATIO` | 비율(0~1) | `DAYUSE_COMMISSION_RATE`, `TIER_STEP_RATIO` |

### 변수
시간·거리를 담는 변수는 단위를 이름에 붙인다 — `checkInMin`, `returnByMin`, `availableMin`, `haversineKm`, `moveMin`, `durMin`. 전부 이 규칙을 따른다(`CourseStop.move`/`dur`·`Place.move`는 2026-10-19에 `moveMin`/`durMin`으로 통일했다 — [GLOSSARY](GLOSSARY.md) "이동(분)"·"체류(분)").

## 5. DB ↔ API
- DB 컬럼: `snake_case` (`room_id`, `check_in_min`).
- API JSON 필드: `camelCase` (`roomId`, `checkInMin`).
- 변환은 **한 곳**(그 테이블을 다루는 모듈의 `rowTo<Something>` 함수 하나)에서만 한다. 예: `server/booking.js`의 `rowToRequest`. 다른 곳에서 `row.room_id`를 직접 camelCase로 바꿔 쓰지 않는다.
- 내부 판정에만 쓰는 컬럼(예: `email_normalized`)은 API 응답에 내보내지 않는다.

## 6. 환경변수
- 서버(`server/*.js`가 `process.env`로 읽는 값): 대문자 스네이크. `AIRPORT_SERVICE_KEY`, `DATABASE_URL`, `ADMIN_USER`.
- 프런트(Vite가 빌드에 내보내는 값, 브라우저에 노출됨): `VITE_` 접두사 + 대문자 스네이크. `VITE_KAKAO_JS_KEY`, `VITE_DEMO_MODE`. 비밀값은 여기 두지 않는다.

## 7. i18n 키
`locales/<lang>.json`에 화면·기능 단위로 네임스페이스를 중첩한다. 리프 키는 camelCase.
```
booking.contact.error.email
booking.consent.thirdParty
```
의미로 짓는다(레거시 문자열 그대로가 아니라 "무엇을 말하는 키인지"). [GLOSSARY.md](GLOSSARY.md)의 용어를 따른다.

## 8. 오류 응답
모든 서버 API가 오류일 때 아래 모양으로 응답한다.
```json
{ "error": { "code": "BOOKING_ACTIVE_REQUEST_EXISTS", "message": "사람이 읽을 설명" } }
```
| 필드 | 규칙 |
|---|---|
| `code` | **대문자 스네이크, `도메인_이유`** 형식. 도메인은 그 오류가 속한 영역(`BOOKING_`, `ADMIN_`, `DATABASE_`, `SERVER_` …), 이유는 무슨 일이 있었는지(`_INVALID_FIELD`, `_NOT_FOUND`). 바뀌지 않는 식별자 — 프런트가 이걸로 분기한다 |
| `message` | 아래 "오류 메시지 사용 원칙" |
| 추가 정보 | `error` 객체 **안에** 같은 레벨로 둔다(`error.status`, `error.from`, `error.to`처럼). `error` 밖에 두지 않는다 |

**오류 코드 목록의 단일 출처는 [docs/api/errors.md](api/errors.md)다.** 새 코드를 추가하거나 의미를 바꾸면 그 문서를 먼저(또는 같이) 고친다. 개별 API 문서(예: [api/booking-requests.md](api/booking-requests.md))는 자기가 쓰는 코드의 부분집합만 보여주고 전체 목록은 그 문서로 링크한다.

### 오류 메시지 사용 원칙 (2026-10-19 명시)
| 규칙 | 내용 |
|---|---|
| `message`의 용도 | **영어 로그용이다.** 서버 콘솔·오류 로그·`curl`로 API를 직접 두드려 볼 때 읽는 문자열이고, **사용자에게 보여주는 화면 문구가 아니다** |
| 화면 표시 | 화면은 `message`를 절대 그대로 띄우지 않는다. **`code`를 i18n 키로 변환**해서 그 언어의 번역된 문구를 보여준다(변환 패턴: 아래) |
| 개인정보 | `message`에도, 서버 로그(`console.log`/`console.error`)에도 **이메일·이름 등 개인정보를 넣지 않는다.** 식별이 필요하면 요청번호(`id`)처럼 개인정보가 아닌 값만 남긴다 |
| 적용 범위 | 고객이 보는 화면(5개 언어) 전부. 아직 번역되지 않은 **내부 관리자 화면(`/admin`)은 예외** — 운영자만 접근하고(Basic 인증) i18n 대상이 아니라서 지금은 `message`를 그대로 보여준다. 관리자 화면이 다국어가 되면 이 예외는 없어진다 |

i18n 변환 패턴(프런트가 실제로 이 API들을 호출하게 될 때 적용): `BOOKING_ACTIVE_REQUEST_EXISTS` → `errors.bookingActiveRequestExists`.

## 9. 커밋 메시지
> 2026-10-18부터 적용. 그 전 커밋(40여 개, 접두사 없는 영어 명령형 — "Add...", "Fix...", "Port...")은 **다시 쓰지 않는다.**

```
<type>: <한 줄 설명(영어, 소문자로 시작하는 명령형)>

<본문 — 왜, 무엇을, 뭘 확인했는지. 한국어든 영어든 괜찮다>
```

| type | 쓸 때 |
|---|---|
| `feat` | 새 기능·동작 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서만 변경(`docs/`, `README.md`, `AGENTS.md`, `CLAUDE.md`) |
| `test` | 테스트 추가·수정(동작 변경 없이) |
| `refactor` | 동작은 그대로, 구조만 정리 |
| `chore` | 위 어디에도 안 맞는 잡무(의존성 업데이트, CI 설정, `.gitignore`) |

범위를 밝히고 싶으면 `feat(booking): ...`처럼 괄호로 붙인다. 이 harness가 덧붙이는 `Co-Authored-By` 같은 귀속 줄은 이 규칙과 별개로 그대로 유지한다.

## 10. 브랜치 이름
```
<type>/<kebab-description>
```
type은 위 커밋 type과 같은 집합(`feat/`, `fix/`, `docs/`, `test/`, `refactor/`, `chore/`). 예: `feat/booking-contact-step`.

**그랜드파더(안 바꿈)**: `main`, `migration/react-ts`, `wip/server-booking`은 이 규칙 전에 만들어졌으니 이름을 유지한다. `wip/`는 작업 백업용으로 계속 써도 된다(이 규칙이 막지 않는다).

## 변경 이력
| 날짜 | 내용 |
|---|---|
| 2026-10-18 | 최초 작성. 현재 코드·문서 조사를 바탕으로 기존 관행을 최대한 존중해 작성. 오류 응답 모양은 이 작성과 같은 작업에서 `server/booking.js`에 바로 적용(테스트 22개 재확인) |
| 2026-10-19 | 오류 메시지 사용 원칙을 별도 절로 명시(영어 로그용, 화면 비표시, 개인정보 금지, 관리자 화면 예외) |
| 2026-10-19 | `checkInMin`/`slotMin` 통일, `move`/`dur`에 `Min` 접미사 부여(실제로 코드에 적용 — STATUS.md "컨벤션 불일치" #2·#3 해소) |
