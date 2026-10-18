# 진행 상태

> 상태: 확정 · 최종 수정 2026-10-18

> 서비스 운영 계획: [product/roadmap](product/roadmap.md) (2026-10-16 공모전 종료, 실제 서비스 전환)

## 단계
| 단계 | 내용 | 상태 |
|---|---|---|
| 1 | 프로젝트 세팅 + docs 뼈대 + 토큰 + CLAUDE.md | 완료 |
| 2 | domain 이식 + formulas md + Vitest | 완료 |
| 3 | 공통 UI 컴포넌트 + 탭바 (+ 직전: i18n JSON 추출) | 완료 |
| 4 | 화면 이식 (Time-Safe → 홈 → 코스 지도 → 예약 → 짐 케어/마이) | 진행 중 — Time-Safe·홈·코스 지도 완료 |
| 5 | 레거시 비교 검증 후 `legacy/`로 이동 | 대기 |

## 브랜치·배포
| 항목 | 상태 |
|---|---|
| 작업 브랜치 | `migration/react-ts` (main 금지 — Render 자동 배포) |
| `wip/server-booking` | 2026-10-18 백업 전용 브랜치. 레거시 `main` 위에서 만든 예약 요청 작업(결제 폼·T2 통합·DB 1차안)을 잃지 않게 담아둔 것 — **그대로 머지하지 않는다.** 살릴 부분은 이미 이 브랜치로 옮겼다(아래 2026-10-18 항목) |
| 로컬 `main` | `origin/main`과 커밋 해시가 갈라져 있다(force-push 이력, **파일 내용은 동일**). main으로 돌아갈 일이 생기면 `git branch -f main origin/main`으로 맞춘다 |
| 새 환경변수 | `DATABASE_URL`, `ADMIN_USER`, `ADMIN_PASSWORD` — `server/.env.example` 참고. 환경별로 다른 DB·자격증명을 쓴다 |
| push | 가능 — 이 저장소만 `credential.https://github.com.username = JAW1006`(로컬 설정). `main`에는 올리지 않음 |
| 백업 | git bundle: `C:\Users\OpenLink\ONSTOP-backup\onstop-migration-react-ts-2026-10-16.bundle` (`migration/react-ts` + `main`, 전체 이력). 복원: `git clone -b migration/react-ts <bundle> <폴더>` |

## 2026-10-18 — 예약 요청 서버 API
레거시 `main`에서 만들던 예약 요청 서버 작업을 이 브랜치로 옮겼다. 프런트는 **이미 있는 `src/features/booking/`을 쓰고**, 서버만 새로 넣었다.

| 결정 | 내용 |
|---|---|
| **B8 "진행 중 1건" 기준** | **정규화된 이메일**(소문자·공백 제거). 숙소와 무관하게 1건. DB 부분 유니크 인덱스로 보장해서 동시 요청에도 2건이 생기지 않는다. 걸리면 `409`이고 **응답에 기존 요청 내용을 담지 않는다**(존재 여부만). 한계: 다른 이메일로는 우회된다 |
| 관리자 인증 | `/admin`과 관리자 API는 HTTP Basic(`ADMIN_USER`/`ADMIN_PASSWORD`). 둘 중 하나라도 비면 **실제 핸들러를 등록하지 않고 503**(fail-closed) — 인증 없이 열린 채 배포되는 경우를 구조적으로 막는다 |
| 스키마 관리 | `server/migrations/*.sql`(이름순 적용, `schema_migrations`에 기록). 코드에서 `CREATE TABLE` 안 한다. 표준 Postgres만 — 공급자를 옮겨도 그대로 돈다 |
| ADR-0002(DB) | **제안 상태 유지.** 구현만 벤더 중립(`DATABASE_URL` + 표준 SQL)으로 먼저 했다. 공급자 확정은 요금·리전·보관기간 확인 후 |
| 로그 | 이메일·이름을 로그·오류 메시지에 쓰지 않는다. pg가 유니크 위반 시 `err.detail`에 이메일을 담으므로 `detail`은 로그에 넣지 않는다 |
| 서버 분리 | 예약 기능은 `server/booking.js`, `server.js`에는 연결 코드만. 외부 API 프록시는 손대지 않았다 |

**버린 것**(이 브랜치에 이미 더 나은 구현이 있어서):
| 버린 것 | 대신 쓰는 것 |
|---|---|
| `app/index.html`의 연락처·요청 폼(전화번호 수집) | `src/features/booking/BookingScreen.tsx` — 동의 3개·필드별 검증·오류 상태·테스트 있음. 연락처는 **이메일** |
| `/api/security-wait?terminal=` 통합안 | 이미 있는 `/api/security-wait` + `/api/security-wait/t2` |

**교훈** → [AGENTS.md](../AGENTS.md) 0장 규칙으로 남겼다: 작업 시작 전 브랜치와 이 문서를 확인하고, 이미 있는 구현·명세를 따른다.

### main 병합 전 확인 — 예약 API 오류 응답 모양을 읽는 프런트 코드 (2026-10-18 조사)
`docs/conventions.md`에 맞춰 `server/booking.js`의 오류 응답을 `{error:"snake_code"}` → `{error:{code:"UPPER_SNAKE",message}}`로 바꿨다. **main에 합칠 때 같이 고쳐야 하는 코드가 있는지** 전체 브랜치·`src/`를 뒤졌다.

| 확인 대상 | 결과 |
|---|---|
| `origin/main`의 `server/server.js`·`app/index.html` | **예약 요청 API 자체가 없다**(`booking-requests` 문자열 자체가 없음) — main에는 고칠 코드가 없다 |
| `origin/wip/server-booking`(main에서 만들다 백업만 해 둔 브랜치)의 `app/index.html` | `submitBookingRequest()`가 `res.ok`만 보고 응답 본문(`.error`/`.message`)은 읽지 않는다 — 모양이 바뀌어도 깨지지 않는다 |
| 같은 브랜치의 `server/admin/index.html`(옛 버전) | `res.ok`조차 안 보고 `fetch().json()`을 그대로 쓴다 — 오류 모양과 무관하게 이미 취약하던 코드(별도 문제, 이번 변경과 무관) |
| `src/features/booking/requests.tsx`(이 브랜치, migration/react-ts) | 서버 API를 아직 호출하지 않는다(메모리 저장소만) — 역시 무관 |
| 옛 소문자 코드 리터럴(`"active_request_exists"` 등 13개) 전체 검색 | `main`·`src/`·히스토리 전체에서 **0건** |

**결론: main을 포함해 어디에도 이 오류 모양을 직접 읽는 코드가 없다.** 병합 시 추가로 고칠 프런트 코드는 없음. (참고로 `wip/server-booking`은 "그대로 머지하지 않는다"로 이미 표시돼 있다 — [브랜치·배포](#브랜치배포).)

### docx에만 있던 내용 (2026-10-18 대조)
`TimeStay_기술개요_로드맵.docx`(2026-09-06, 레거시 기준)를 `docs/*.md`와 대조했다. 바이너리는 diff가 안 되고 .md와 갈라지므로 **저장소에서 빼고** `local-docs/`(gitignore)로 옮겼다.

아래는 .md에 **없는** 내용이다 — 살릴 것은 .md로 옮겨야 한다.
| # | docx 내용 | 옮길 곳 | 비고 |
|---|---|---|---|
| 1 | **앱 2단계: React Native 전환** — 핵심 화면(코스 빌더·지도)을 RN으로 재작성, 카카오맵 웹 SDK → 네이티브 SDK 또는 `react-native-maps` | [roadmap](product/roadmap.md) "앱 전환 대비" | 지금 roadmap은 Capacitor 준비(C1~C6)까지만 있다 |
| 2 | **동선 최적화: 카카오모빌리티 다중경유지 API 또는 TSP 근사** | [time-fit](formulas/time-fit.md), [external-apis](operations/external-apis.md) | 현재 A6는 순차 경로(탐욕)뿐. 다중경유지 API 쿼터·요금 **미확인** |
| 3 | **카카오모빌리티 보행자 길찾기 별도 제휴 신청** 시 도보 실경로 적용 | [external-apis](operations/external-apis.md) | 현재 도보는 직선×1.3 근사 |
| 4 | **백그라운드 위치 기반 "게이트 임박 알림"**, 딥링크(파트너 프로모션) | [ADR-0006](decisions/ADR-0006-return-alert.md) | ADR-0006은 앱 내 카운트다운·캘린더·기기 알림까지만. 백그라운드 위치는 개인정보 영향 큼 → legal 확인 필요 |
| 5 | **지도 공급자 전환 검토 결론** — 네이버지도는 핵심 이슈(네이티브 POI 클릭) 해결 불확실, 전환 비용 대비 실익 재검토 필요 | [external-apis](operations/external-apis.md) | 현재 그 문서에는 네이버 Directions **요금**만 있고 지도 공급자 전환 판단이 없다 |
| 6 | **수집 전략 수치** — 카카오 로컬 18개 업종 코드 + 뷰티 브랜드 7곳 키워드, 업종당 페이지네이션으로 최대 45곳 | [design/data](design/data.md) | 레거시 구현 기준. 이식본과 같은지 확인 필요 |
| 7 | 관리자용 **파트너·요금 관리 도구** | [roadmap](product/roadmap.md) | 지금 `/admin`은 예약 요청 확인만. 숙소·가격표 관리는 없다 |
| 8 | ⚠ **"카카오 API 응답 캐싱(반복 조회 비용 절감)"** | — | **반영하지 말 것.** [external-apis](operations/external-apis.md)의 응답 저장·캐시 금지(운영정책 제5조 제20호)와 **정면으로 어긋난다**. docx가 그 제약을 모른 상태에서 쓰였다 |

docx의 나머지(서비스 개요, 레거시 스택 — importmap·Babel Standalone, 구현 완료 기능, 결제·요금·예약 연동 제한, 1.2km 도보 근사, Capacitor 1단계, 웹 서비스화 단계)는 이미 .md에 있다.

## 결정됨
| # | 결정 | 공식 | 적용 |
|---|---|---|---|
| 예약 요청 서버 | 저장·조회·취소 + 관리자 목록·상태 변경. 결제 없음, 호텔 자동 전달 없음 | [api/booking-requests](api/booking-requests.md) | 적용 — 진짜 Postgres 통합 테스트 22개 통과(아래 "예약 요청 API 테스트") |
| B1 | 코스 경로 **공항 → 호텔 → 장소들 → 호텔(짐 찾기) → 공항**. 데이유즈 블록을 고르면 **호텔 복귀 ≤ 블록 종료**가 코스 제약, 예약 화면 경고(B3)도 이 기준. 코스 사용 시간이 늘어 추천이 더 보수적 | [time-fit](formulas/time-fit.md), [결과](results/2026-10-16-hotel-return-route.md) | 적용 |
| 예약 요청 (B2–B8) | 코스 없이도 요청(근사), 블록 초과·복귀 늦음은 경고 + 확인 체크, 연락처는 이름(영문 허용)·이메일만, 상태 요청됨·확정·거절·만료·취소됨(만료 시간은 호텔 응답 속도로 정함), 거절·만료 시 대안 숙소 제안, 진행 중 요청 1건, 요청됨만 즉시 취소(확정 후는 호텔 문의 + 연락처·규정 표시) | [screens/booking](design/screens/booking.md) | 적용(데모) |
| 요청 모드 | 가격표 있는 호텔 = 상품 선택 후 요청, 없는 호텔 = **견적 요청**(호텔이 가격·가능 여부 회신). 데모는 데모용 가격표 파일(`src/data/demo-offers.json`, 사용자 입력) | [screens/booking](design/screens/booking.md), [dayuse-pricing](formulas/dayuse-pricing.md) | 적용(데모) |
| 늦은 체크인 슬롯 | 슬롯이 코스의 호텔 도착보다 늦으면 **코스 전체를 그만큼 늦춰** 계산(대기 시간은 사용 시간에 포함) | [time-fit](formulas/time-fit.md), [dayuse-pricing](formulas/dayuse-pricing.md) | 적용(데모) |
| 호텔 참여 상태 | 확정 / 협의 중 / 미참여. **운영은 확정 호텔만 노출**, 데모는 전부(상태 표시). 기본값 미참여 | [screens/booking](design/screens/booking.md) | 적용(데모) |
| A9 | 데이유즈 가격은 **계산식 추정 금지** — 호텔별 실제 판매 블록·가격표(`DayuseOffer`/`DayuseProduct`)로. 값은 호텔 인터뷰로 입력, 없으면 "가격 확인 중". `TIER_STEP_RATIO` 폐기 예정 | [dayuse-pricing](formulas/dayuse-pricing.md), [data-verification](design/data-verification.md) 수동 입력 구역, [hotel-interview](product/hotel-interview.md) | 문서 확정, 구현은 예약 화면 때 |
| 화면 순서 | 데이유즈 예약 → 마이 → 짐 케어. 첫 예약은 **결제 없이 "예약 요청 → 호텔 확인"** | [roadmap](product/roadmap.md), [screens/booking](design/screens/booking.md) | 명세 작성, 구현은 사용자 확인 후 |
| 결제·정산 | ADR-0004는 **제안 상태 유지**(A 플랫폼 정산 / B 호텔 직접 결제 + 월 수수료 청구). 호텔 인터뷰·법적 확인 후 결정 | [ADR-0004](decisions/ADR-0004-payment.md) | 결정 전 |
| 복귀 알림 방향 | 앱 안 카운트다운·캘린더(.ics) 먼저 → 앱 출시 때 기기 내 예약 알림 → 웹 푸시는 보조. iOS 제약은 WebKit 원문(2023-02-16)으로 확인 | [ADR-0006](decisions/ADR-0006-return-alert.md) | 방향 확정, ADR은 제안 |
| 앱 전환 대비 | 모노레포에 `apps/mobile` 자리, 서버 주소 `VITE_API_BASE`(`apiUrl`), 저장소 접근은 `src/lib/storage.ts` 한 곳 | [roadmap](product/roadmap.md) "앱 전환 대비" | 계획 |
| 좌표 교체 | 레거시 좌표는 카카오 응답 저장 금지 조항 위반 가능성 → 제휴 업체 제공·직접 측정 등으로 교체(5단계 계획) | [external-apis](operations/external-apis.md) | 계획 |
| 법률 우선순위 | 숙소 사진 사용 허락(허락 없으면 사진 내리고 대체 표시), "외출 가능 ≠ 입국 가능" 안내·면책 문구 | [legal-checklist](legal-checklist.md) 0장 | 확인 전 |
| A6 | 코스 계산을 순차 경로(공항→호텔→장소들→공항)로. 구간 캐시, 실패 시 근사 "약 N분". 기존 별 모양은 비교용으로 유지 | [time-fit](formulas/time-fit.md) | 적용(코스 지도) |
| 코스 색·선 | 체류 연한 파랑, 코스 화면 카테고리 배지 회색+아이콘·글자, 청록은 임시(역할 토큰 `--ts-role-route`), 선 모양으로 수단 구분 | [design-tokens](design/design-tokens.md) | 적용 |
| 요약 패널 | 지도 아래 고정 | [screens/course-map](design/screens/course-map.md) | 적용 |
| ODsay 선택 필드 | `/api/transit`에 `distanceM`·`busTransitCount`·`subwayTransitCount`(있을 때만). 칩은 값이 없으면 시간만 | [api/environment](api/environment.md) | 적용 |
| 알림 문구 | 기능 없는 알림 문구 4개 삭제(`timeSafe.pushScheduled`, `course.step.return.sub`, `confirm.alertOn`, `my.menu.timeSafeAlerts`). 복귀 알림 방식은 [ADR-0006](decisions/ADR-0006-return-alert.md)에서 결정 | [i18n-review](design/i18n-review.md) "삭제한 레거시 키" | 적용 |
| 자동 추천 0곳 | 남은 시간에 들어가는 장소가 없으면 안내 문구(`course.autoBuild.empty`, 미검수) | [screens/course-map](design/screens/course-map.md) | 적용 |
| 근사값·조회 시점 | 코스 빌더·자동 추천은 **보수적 근사**(직선 × 6분/km, 도보 ×1.3, 미검증)만, 후보 구간 미리 조회 없음. **실제 경로는 코스 확정(저장) 후에만** 조회. ODsay 쿼터·상업 이용은 사용자가 콘솔에서 확인·문의 중 | [time-fit](formulas/time-fit.md), [external-apis](operations/external-apis.md) | 적용 |
| 번역 정책 | **공개 전 모든 번역(레거시 185 + 추가·변경 36)을 원어민 검수**. 검수 표 2개 유지 | [i18n-review](design/i18n-review.md), [i18n-review-legacy](design/i18n-review-legacy.md) | 진행 전 |
| A7 | 자동 추천 설명 "OR-Tools 최적화 · …" → "시간에 맞춰 자동 추천 · 카테고리마다 남은 시간에 들어가는 장소를 1곳씩 담아요"(5개 언어, 미검수). 버퍼 안내 문구는 홈 이식 때 "예상 소요 반영 …"으로 이미 대체 | [i18n-review](design/i18n-review.md) | 적용 |
| 탑승동 | 탑승동(P02) 연결편에 T1 출국장 실시간 대기 적용(사용자 결정). 셔틀 버퍼는 미검증·미적용 | [time-safe](formulas/time-safe.md) | 적용 |
| T2 | 출국장 실시간 대기를 T1·T2 모두(`/api/security-wait/t2` 추가), 홈 배지는 터미널 기준 "T1/T2 실시간 확인 · 현재 N분" 또는 "실시간 아님" | [time-safe](formulas/time-safe.md), [api/incheon-congestion](api/incheon-congestion.md) | 적용 |
| 카카오맵 도메인 | `http://localhost:5173` 등록 완료(사용자, 2026-10-16). 이 주소에서 JS SDK 인증·지도 타일 로드 확인. 개발 서버 포트는 5173 고정(`strictPort`). `127.0.0.1`로는 열지 않는다(Vite가 localhost만 수신) | [api/environment](api/environment.md) | 확인 |
| ODsay 키 | 서버용 키 + 개발 PC 공인 IP 등록 후 `/api/transit` 정상(2026-10-16: 호텔 오라→원보만두 95분·2,800원, 웨스턴그레이스→원보만두 76분·3,700원). **배포 시 Render 서버 IP도 ODsay에 등록 필요** | [api/environment](api/environment.md) | 확인 |
| API 형식 | 항공편 시각은 `HHMM`만(날짜 없음) — 2026-10-16 실제 호출로 확인. A2 날짜 경로·24h 경고는 현재 API로는 쓰이지 않음 | [api/incheon-flights](api/incheon-flights.md) | 확인 |
| A2 | 자정 넘김: 날짜 우선, 없으면 출발 < 도착이면 익일, 24h 초과 경고 | [time-safe](formulas/time-safe.md) | 적용 (날짜 경로는 API 미검증) |
| A3 | T1 출국 실시간 대기: `max(기준값, 실시간)` | [time-safe](formulas/time-safe.md) | 적용 |
| A1 | 버퍼 3요소 구조 확정(입국심사 / 출국 보안검색·출국심사 / 게이트 여유), 기본값 50/50/30 | [time-safe](formulas/time-safe.md) | 적용 — **값은 미검증** |
| A5 | 외출 가능 시간 / 코스 가용 시간 용어 분리 | [GLOSSARY](GLOSSARY.md) | 적용 |
| 요약 | 일정 요약 "사용 X / 가용 Y" = (이동 + 체류 + 준비) / 외출 가능 시간 — (b) | [GLOSSARY](GLOSSARY.md), [time-fit](formulas/time-fit.md) | domain 적용(`scheduleSummary`), 화면은 코스 이식 때 |
| 외출 불가 CTA | 외출 불가면 "스마트 코스 추천" 비활성 + 이유 문구(레거시와 다름) | [screens/time-safe](design/screens/time-safe.md) | 적용 |
| 버퍼 표기 | 버퍼 구성 줄은 "예상/약"을 붙여 미확정임을 표시 | [screens/time-safe](design/screens/time-safe.md) | 적용 |
| i18n | react-i18next + 언어별 JSON(ko/en/zh/ja/vi), 의미 기반 키, ko→en 폴백, 키 타입 검사 | [ADR-0001](decisions/ADR-0001-react-migration.md), [키 대응표](design/i18n-keys.md) | 적용 (190개 추출) |

## 결정 필요
| # | 내용 | 근거 문서 |
|---|---|---|
| 운영 ADR | DB(ADR-0002)·인증(0003)·결제·정산 구조(0004, 제안 — A/B 비교·법적 확인 L1~L7)·환경·배포(0005)·복귀 알림(0006, 방향만 확정) — 모두 초안 | [decisions/](decisions/) |
| DB 공급자 | ADR-0002를 확정하려면: Render PG vs Supabase 요금·백업, 데이터 **리전**(국외 이전 — legal 2-4), 보관 기간·파기(legal 2-1), dev/staging/prod DB 분리, SSL CA 번들. 구현은 벤더 중립이라 **지금 막혀 있지 않다** | [ADR-0002](decisions/ADR-0002-database.md) "결정 전에 할 일" |
| 요청 만료 기한 | 자동 만료를 켤 기한 값(호텔 응답 속도 — 인터뷰 2-2·2-6). 지금 `expiresAt`은 항상 null이고 `expired`는 관리자 수기만 | [screens/booking](design/screens/booking.md) 6번 |
| 동의 문구 버전 | 서버가 `consentVersion`을 저장한다. legal 확인으로 문구가 확정되면 버전 값을 정해 프런트·문서에 같이 박는다 | [legal-checklist](legal-checklist.md) 2-1·7-6 |
| 외부 API | 공공데이터 운영계정 전환, ODsay 쿼터·상업 이용(**사용자 확인 중**), 경로 API 대안(TMAP 등, 미확인), 카카오모빌리티 쿼터·계약, 카카오 응답 저장 금지 준수(레거시 좌표 교체) | [operations/external-apis](operations/external-apis.md) |
| 법률 | 0장(사진 허락·외출≠입국) 먼저, 나머지 전 항목 확인(결론 없음, 전문가 확인 필요) | [legal-checklist](legal-checklist.md) |
| 데이터 | 숙소·장소 미검증 값 116개 | [design/data-verification](design/data-verification.md) |
| A1-값 | 버퍼 값 근거. 현재 ① `ARRIVAL_IMMIGRATION_MIN` 50(기획서) / ② `DEPARTURE_SECURITY_MIN` 50(레거시) / ③ `GATE_MARGIN_MIN` 30(레거시) — 전부 미검증. 입국 대기는 분 단위 공개 API 없음(인원 수만 제공) | [time-safe](formulas/time-safe.md), [조사](results/2026-10-16-arrival-wait-data.md) |
| A9-값 | 호텔 10곳의 판매 블록·가격·시작 가능 시각·연장·취소·노쇼 — 인터뷰로 입력 | [data-verification](design/data-verification.md) 수동 입력 구역, [hotel-interview](product/hotel-interview.md) |
| 홈 숙소 카드 가격 | 홈 데이유즈 카드가 아직 레거시 추정 가격("₩50,000~")·시간 범위(3–9h)를 표시 — A9(추정 가격 금지)와 어긋남. 가격표 기준으로 바꿀지, 가격 없으면 "견적 요청" 표시로 바꿀지 | [results](results/2026-10-16-booking-screen.md) |
| A13 | 브랜드 컬러: 앱(Blue/Gold) vs 로고 README(Teal/Coral) | [design-tokens](design/design-tokens.md) |
| 수수료 | 수수료 계산 기준·반올림 | [dayuse-pricing](formulas/dayuse-pricing.md) |
| 탑승동 셔틀 버퍼 | 탑승동(P02, 게이트 101~132) 출발은 T1 출국장 통과 후 셔틀트레인을 탄다. 이 이동·대기에 별도 버퍼가 필요한지 **미검증** — 지금은 추가 버퍼 없음(게이트 여유 30분 안에 흡수된다고 가정, 근거 없음). 근거 후보는 아래 "탑승동 셔틀트레인 근거" | [time-safe](formulas/time-safe.md) |
| 입국 실시간 | 입국장 대기인원 → 분 환산(창구 수·처리량 가정 필요). 근거 확보 전 보류 권장 | [조사](results/2026-10-16-arrival-wait-data.md) |
| 컨벤션 집행 장치 | [conventions.md](conventions.md)를 사람이 안 보고 지나쳐도 걸러내는 장치(ESLint 이름 규칙, Prettier, 오류 코드·i18n 일치 테스트, CI 추가) — 제안만 있고 **설치 전**(2026-10-18, 아래 "컨벤션 불일치" 참고). 설치 여부·범위는 사용자 확인 후 | [conventions.md](conventions.md) |

## 컨벤션 불일치 (2026-10-18 조사, [conventions.md](conventions.md) 기준)
`docs/conventions.md`를 쓰기 전부터 있던 코드 중 그 문서와 어긋나는 부분. **지금 당장 고치지 않는다** — 새로 그 코드를 만지는 작업에서 자연스럽게 정리하거나, 아래 각 줄에 적힌 영향이 실제로 문제가 될 때 고친다.

| # | 어디 | 내용 | 영향 |
|---|---|---|---|
| 1 | `server/server.js` (레거시 프록시 — `/api/flight/*`, `/api/route`, `/api/places*`, `/api/transit`, `/api/security-wait*`) | 오류 응답이 `{ error: "자유 영어 문장" }` — 코드도 없고 `message` 분리도 없다. `docs/api/errors.md`의 코드 체계와 전혀 다름 | 지금은 문제 없음(프런트가 이 응답의 `error`를 사람이 읽는 문구로만 쓴다). 이 엔드포인트들을 다시 만질 일이 생기면 `BOOKING_*`처럼 도메인 접두사(`FLIGHT_`/`ROUTE_`/`PLACES_`/`TRANSIT_`/`CONGESTION_`)로 옮긴다 |
| 2 | ~~`src/domain/dayuse-pricing.ts`~~ | ✅ **2026-10-19 해소.** `slotMin`(`productStartsAt`·`defaultProduct`·`blockEndMin`·`bookingCheck`)을 `checkInMin`으로 통일. [GLOSSARY](GLOSSARY.md) "체크인 슬롯"에 기록 | — |
| 3 | ~~`src/domain/time-fit.ts`, `src/data/index.ts`~~ | ✅ **2026-10-19 해소.** `move`→`moveMin`, `dur`→`durMin`(+ 같은 문제였던 `roomMove`→`roomMoveMin`, `rankMove`→`rankMoveMin`도 같이). `legacy-data.json`·추출 스크립트까지 포함. [GLOSSARY](GLOSSARY.md) "이동(분)"·"체류(분)" | — |
| 4 | `src/domain/time-fit.ts`, `dayuse-pricing.ts` | 불리언을 반환하는데 `is`/`has`/`can` 접두사가 없는 함수: `fitsBudget`, `fitsSequential`, `wouldFit`, `wouldFitSequential`, `productStartsAt`(컨벤션 3장 "참고") | 낮음 — 영어로 자연스럽게 읽히는 서술형. 새 불리언 함수만 `is`/`has`/`can`을 기본으로 한다 |
| 5 | 전체 커밋 이력(68cf883 이전, 40여 개) | 접두사 없는 자유 영어 명령형(`Add...`, `Fix...`, `Port...`) — 2026-10-18부터 `feat:`/`fix:`/… 접두사 적용 | 과거 커밋은 다시 쓰지 않는다. `git log`에서 접두사 있는 커밋과 없는 커밋이 2026-10-18을 기준으로 섞여 보이는 게 정상이다 |

## 운영 배포 금지·예약 요청 운영 기준 (2026-10-16 결정 · 2026-10-18 유지)
**운영(프로덕션) 배포 금지**: 서버가 예약 요청을 **실제로 호텔에 전달하고 회신을 받기 전까지** prod에 배포하지 않는다([ADR-0005](decisions/ADR-0005-environments-deploy.md) "운영 배포 금지 조건").
- 2026-10-18: 서버 저장이 생겼지만 **금지는 그대로다.** 저장·회신 반영(수기)은 되지만 **호텔 자동 전달과 이메일 발송이 없다** — 금지의 핵심 조건이 그것이다.
- 프런트 요청은 여전히 데모다. 프런트는 아직 메모리 저장소를 쓰고 서버 API로 교체되지 않았다.
- 요청 버튼은 **데모 표시가 있는 환경**(`VITE_DEMO_MODE=true` 또는 개발 서버)에서만 동작한다. 그 밖의 빌드에서는 비활성이고 "준비 중"으로 표시한다. **서버가 생겼다는 이유로 이 게이트를 열지 않는다.**
- 관리자 화면은 자격증명이 없으면 503으로 닫힌다(fail-closed). 이 동작을 느슨하게 만들지 않는다.

**예약 요청을 운영에서 켜는 기준(모두 충족)**
| # | 기준 | 확인 위치 |
|---|---|---|
| 1 | 참여 상태 **확정** 호텔이 1곳 이상(몇 곳부터 공개할지는 결정 필요) | data-verification 수동 입력 구역, [hotel-interview](product/hotel-interview.md) 0-6 |
| 2 | 그 호텔의 요청 접수 방법·응답 기한(만료 시간) 확인 | 인터뷰 0-5·2-6 |
| 3 | 그 호텔의 연락처(앱 표시 허락)·확정 후 취소 규정 입력 | 인터뷰 4-5~4-8 |
| 4 | 서버가 요청 저장·호텔 전달·회신 반영·이메일 발송 — **저장·회신 반영(수기)만 됨. 호텔 전달·이메일 발송 미구현** | [api/booking-requests](api/booking-requests.md) "미구현 / 의존" |
| 5 | legal 0장(사진·외출≠입국), 개인정보 수집·제3자 제공 동의 문구, 7장(제휴 형태) 확인 | [legal-checklist](legal-checklist.md) |

**대안 — 정보 보기 모드**(기준 충족 전 운영을 열어야 할 때)
| 안 | 내용 | 확인 필요 |
|---|---|---|
| 정보 보기 | Time-Safe·코스 계산은 그대로, 숙소는 "곧 예약 가능"으로 정보만(가격 없음), 요청 버튼 없음 | 미참여 호텔 정보 표시 가능 여부(legal 7-3) |
| 외부 연결 | 숙소 카드에서 호텔 공식 사이트·연락처로 연결 | 링크·상표 사용(legal 7-2), 연결 대상 정확성 |
| 숙소 숨김 | 확정 호텔이 없으면 숙소 영역을 숨기고 코스는 공항 기준으로만 | 코스 계산이 숙소를 전제로 함 — 화면 설계 필요 |

## 탑승동 셔틀트레인 근거 (2026-10-16 조사, 전부 미검증)
| 내용 | 출처 | 확인 상태 |
|---|---|---|
| T1 ↔ 탑승동 셔틀트레인 **5분 주기** 운행 | 인천공항 공식 "탑승동 → 제1 여객터미널" 안내 [airport.kr/ap_ko/933](https://www.airport.kr/ap_ko/933/subview.do) | 검색 요약으로만 확인 — **원문 미확인**(페이지가 동적 로딩) |
| T1 → 탑승동 약 5분 소요, 24시간 운행, 탑승 후 터미널로 되돌아갈 수 없음 | 인천공항 영문 출국 안내 [airport.kr/ap_cnt/en/dep/process/deppro.do](https://airport.kr/ap_cnt/en/dep/process/deppro.do) | 검색 요약으로만 확인 — 원문 가져오기 실패 |
| 열차 주행 1분30초~1분50초, 05:00~22:30 구간별 2편성 | [이데일리 "공항24시" 셔틀트레인 기사](https://m.edaily.co.kr/News/Read?newsId=01302166622652264&mediaCodeNo=257) | 언론, 작성 시점이 오래돼 현재와 다를 수 있음 |
| 6분 간격 운행 | [위키백과 인천국제공항 셔틀트레인](https://ko.wikipedia.org/wiki/%EC%9D%B8%EC%B2%9C%EA%B5%AD%EC%A0%9C%EA%B3%B5%ED%95%AD_%EC%85%94%ED%8B%80%ED%8A%B8%EB%A0%88%EC%9D%B8) | 비공식, 공식 5분과 다름 |
| 승강장 이동·대기 포함 실제 소요 약 20분 | [나무위키 인천국제공항 셔틀트레인](https://namu.wiki/w/%EC%9D%B8%EC%B2%9C%EA%B5%AD%EC%A0%9C%EA%B3%B5%ED%95%AD%20%EC%85%94%ED%8B%80%ED%8A%B8%EB%A0%88%EC%9D%B8) | 비공식, 측정 근거 없음 |

정리: 열차 대기(최대 5~6분) + 주행(약 5분 이내)만 보면 10분 안팎, 승강장까지 걷는 시간을 포함하면 최대 20분이라는 비공식 설명도 있다. 공식 원문 확인 전까지 별도 버퍼는 넣지 않는다.

## 사용자 조치 필요
| # | 내용 |
|---|---|
| 호텔 데이터 입력 | `src/data/hotel-partners.json`의 참여 상태·연락처·취소 규정·가격표(인터뷰 결과), 데모용 `src/data/demo-offers.json`(데모 가격표 — 값은 사용자가 입력) |
| ODsay 쿼터·상업 이용 | 콘솔 등급·일일 한도, 상업 서비스 이용 가능 여부 확인(그 전까지 빌더는 근사만) |
| 호텔 인터뷰 | 5곳 이상 — [hotel-interview](product/hotel-interview.md) 질문, 답변은 data-verification 수동 입력 구역에 |
| 카카오맵 JS 키 | 레포 루트에 `.env.local`을 만들고 `VITE_KAKAO_JS_KEY=<레거시 지도와 같은 앱의 JavaScript 키>`를 넣는다(`.env.example` 참고, git에 안 올라감). 비어 있으면 코스 화면 지도 자리에 안내 문구만 나온다 |
| 실제 지도 확인 | 아래 "실제 지도 확인 절차" |

## 실제 지도 확인 절차 (코스 지도)
테스트는 모의 지도로만 했다. 실제 카카오맵은 아래 순서로 확인한다.

**준비**
1. `server/.env`가 채워져 있는지 확인(키는 건드리지 않는다).
2. 레포 루트 `.env.local`에 `VITE_KAKAO_JS_KEY` 입력(위 "사용자 조치 필요").
3. 터미널 1: `cd server && npm start` (3001) · 터미널 2: `npm run dev` (5173 고정).
4. 브라우저로 **`http://localhost:5173`**(127.0.0.1 아님) → 온보딩에서 **오늘 실제 운항하는** 도착편·연결편 조회(당일 편만 조회됨) → 스마트 코스 추천 → 코스 탭.

**확인 항목**
| # | 확인 | 기대 |
|---|---|---|
| 1 | 지도가 뜨는가 | 안내 문구가 아니라 지도 타일. 실패하면 키 값, 도메인 등록(`http://localhost:5173`), 카카오맵 제품 활성화 순으로 확인 |
| 2 | 숙소를 고르기 전 | 공항(✈ 남색)과 호텔 10곳(작은 회색 H). 회색 H를 누르면 그 숙소가 선택된다 |
| 3 | 숙소 선택 후 | 선택 호텔은 금색 H + 이름, 공항→호텔 선 + 칩, 호텔→공항 **빨간 긴 파선** + "복귀" 칩 |
| 4 | 장소 2~3곳 추가 | 파랑 번호 핀 1·2·3, 구간이 공항→호텔→1→2→…→공항 순서로 이어짐. 칩 시간 합 = 요약 막대의 "이동 N분" |
| 5 | 선 모양 | 대중교통 굵은 실선, 택시 보통 실선, 도보 가는 점선, 복귀 빨간 긴 파선 — **도보 점선과 복귀 파선이 확실히 구분되는지** |
| 6 | 색 | 이동 선·칩은 모두 같은 청록(구간마다 색이 바뀌지 않음), 복귀만 빨강 |
| 7 | 칩 | 수단 아이콘 + 시간(크게) + 거리(작게, 실제 값일 때만). 근사 구간은 "약 N분" |
| 8 | 구간 선택 | 칩이나 선을 누르면 그 구간만 굵고 진하게, 나머지는 옅게 + 지도 아래 한 줄 정보. 다시 누르면 해제 |
| 9 | 확대 | 레벨 6 이하로 확대하면 후보·참고용 회색 점이 보이고, 점을 누르면 장소 상세 시트(참고용은 이름만) |
| 10 | 확대 중 화면 유지 | 장소를 넣고 빼도 확대해 보던 위치로 되돌아가지 않는다(숙소를 바꿀 때만 중심 이동) |
| 11 | 저장된 코스 | 저장 후 지도에 다른 호텔·후보 점 없이 코스만 보인다 |

결과는 `docs/results/YYYY-MM-DD-course-map-real.md`에 스크린샷과 함께 남긴다.

## 자료 갱신 필요
| # | 내용 |
|---|---|
| 앱 화면 이미지 | 지원서·소개 자료의 앱 화면 캡처는 레거시(3시간 1분, 버퍼 구성 줄 없음, 외출 불가여도 CTA 활성) 기준이다. 새 화면(2시간 11분, "예상 소요 반영" 줄, 외출 불가 시 CTA 비활성, 코스 지도 v2)으로 **다시 캡처 필요** — 버퍼 값 확정 후 |
| 지원서 예시 | 지원서 이미지의 "4h21m − 입국심사 50분 − 게이트 30분 = **3h01m**" 예시가 현재 앱 기본값(50/50/30 → **2h11m**)과 맞지 않는다. 값 확정 후 이미지·문구 갱신 필요. 계산 비교는 [time-safe](formulas/time-safe.md) "합계 비교" |

## 개선 후보
| # | 내용 |
|---|---|
| 번들 크기 | 메인 JS 605KB(빌드 경고 기준 500KB 초과, 코스 지도 이식 후). 화면 이식이 끝난 뒤 라우트별 지연 로딩(`lazy`)으로 분할 |
| 로고 이미지 | `logo-mark.png` 405KB(30~40px로 표시) — 레거시와 같은 파일. 작은 PNG/SVG로 교체 검토 |
| 근사 계수 검증 | 보수적 계수(6분/km)는 실측 2건 기준. 확정 후 실제 경로와 근사의 차이를 모아 계수 조정(근사가 실제보다 짧아지는 사례가 없는지) |
| 구간 상세 시트 | 칩 탭 시 한 줄 정보(수단·시간·거리·환승·요금)만 구현. 노선 단계별 안내 시트는 미구현 |
| 확정 후 취소 요청 상태 | (B8 후보) 확정된 요청을 앱에서 "취소 요청" → 호텔 확인 후 취소됨. 호텔별 확정 후 취소 규정(인터뷰 4-5~4-8)을 확인한 뒤 추가 — 지금은 "호텔에 문의" 안내 + 연락처·규정 표시만 |
| 짐을 호텔에 맡기지 않음 | (B1 후보) 짐이 없거나 공항에 맡긴 사용자는 호텔 복귀를 생략하는 옵션 — 지금은 만들지 않음(2026-10-16 결정) |
| 짐 찾기·샤워 시간 | 호텔 복귀 후 머무는 시간은 0분으로 계산(기존 "숙소 체류 없음" 유지). 실제 소요를 인터뷰로 확인해 반영 여부 검토 |
| 진행 방향 화살표 | 레거시의 선 위 화살표·구간 번호 배지는 옮기지 않음(칩으로 대체) |

## 검증 부족
| # | 내용 | 계획 |
|---|---|---|
| 실제 카카오맵 화면 | 코스 지도는 모의 지도로만 테스트 | 사용자 확인 — 위 "실제 지도 확인 절차" |
| `/admin` 화면 조작 | 목록·필터·확정/거절/만료/취소 버튼은 **자동 테스트가 API만** 검증한다. 화면에서 버튼이 전이 규칙대로만 보이는지는 사람이 확인해야 한다 | `ADMIN_USER`/`ADMIN_PASSWORD`를 넣고 `/admin` 열어 확인 |

## 예약 요청 API 테스트 (2026-10-18)
**진짜 PostgreSQL**에 붙는 통합 테스트 22개 — `server/booking.test.js`. 모의 DB가 아니다.

| 명령 | 내용 |
|---|---|
| `cd server && npm test` | docker compose로 **일회용 Postgres**(포트 5433, tmpfs — 컨테이너를 내리면 데이터 소멸)를 띄우고 전부 실행, 끝나면 자동 정리 |
| `cd server && npm run test:nodb` | Docker가 없을 때. DB가 필요 없는 경로만 돌고 통합 테스트는 **건너뛴다**(건너뛴 사실을 출력) |
| CI | `.github/workflows/ci.yml`의 `server` 잡이 Postgres **서비스 컨테이너**로 매 푸시마다 실행. 건너뛰면 CI가 실패한다(조용히 통과하는 것 방지) |

안전 가드 — 이 테스트는 `booking_requests`를 TRUNCATE하므로 3중으로 막는다:
| 가드 | 동작 |
|---|---|
| `TEST_DATABASE_URL` 없음 | 건너뜀(실행 안 함) |
| `TEST_DATABASE_URL` == `DATABASE_URL` | **중단** — 실제 DB를 비울 수 있다 |
| 호스트가 로컬이 아님 | **중단** — 일회용이 확실하면 `ALLOW_REMOTE_TEST_DB=1` |

덮는 범위(위 "DB 연결 후 확인할 것" 11개를 자동화한 것):
마이그레이션 적용·재실행 멱등·B8 인덱스 존재 · 생성(201·`TS-` 8자·필드 보존·`expiresAt` null) · 견적 모드 · 입력 검증 400 6종 · **B8**(같은 이메일 409·대소문자 정규화·동시 요청 4건 중 1건만 성공·본문에 내용 없음) · 조회(맞는/틀린 이메일·없는 번호가 구분 안 됨·`email_required`) · 취소(요청됨만·재시도 409·확정은 불가·남의 이메일 불가·취소 후 재요청 가능) · 전이(confirmed→declined/expired/requested 거부·종료 상태 거부·사유 필수·없는 상태값 400) · 인증(무인증·틀린 비번·틀린 사용자 401, 정상 200, PATCH도 필요, 고객용은 인증 없이 동작, status 필터) · 로그에 이메일·이름·pg `detail` 없음 · **fail-closed**(자격증명 미설정 시 503, 인증을 들고 가도 안 열림, 고객용은 정상)

## 검증 완료
| # | 내용 | 근거 |
|---|---|---|
| 코스 계산·자동 추천 이식 | 레거시 화면을 같은 입력(항공편 3종 × 장소 0·1·3·자동 추천)으로 조작한 값 = 옮긴 레거시 함수 값. 새 화면과의 차이는 A1·A6로 모두 설명됨 | [results/2026-10-16-course-map-compare](results/2026-10-16-course-map-compare.md), `time-fit.test.ts` "레거시 화면 관측값" |
