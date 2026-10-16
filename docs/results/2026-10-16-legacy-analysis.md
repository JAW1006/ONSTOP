# 레거시 구조·계산 로직 분석

> 상태: 확정 · 2026-10-16 · 대상 커밋 `e665a38`

## 목표
React 이식 전에 레거시 앱의 구조와 계산 로직을 정리하고, 공식과 어긋나거나 모호한 부분을 찾아낸다(이 단계에서는 고치지 않음).

## 방법
`app/index.html`(2,086줄), `server/server.js`(377줄), `README.md`를 전부 읽고 계산식을 줄 번호와 함께 추출했다.

## 수치 — 구조
| 항목 | 현황 |
|---|---|
| 실행 방식 | CDN importmap(React 18.3.1, lucide-react) + Babel Standalone, 빌드 없음 |
| 라우팅 | 없음. `App`의 `screen` 문자열 상태로 전환 (`onboarding/home/booking/confirm/luggage/course/savedCourse/mypage`) |
| 전역 상태 | 전부 `App` useState (lang, cats, flight, connFlight, room, coursePlan, savedCourse, bookings, lookups, notice) |
| 다국어 | `STR` 객체 ~190키 × 5언어, `useLang()`의 `t/tr/fmtTime` |
| 데이터 | `ROOMS` 10곳, `PLACES` 7카테고리 22곳(중복 2곳 의도적), `HOT_PLACE_IDS` 6곳 |
| 스타일 | 인라인 style 객체 + `C` 팔레트 13색 |
| API (프록시 `:3001`) | `/api/flight/arrival`, `/api/flight/departure`, `/api/security-wait`, `/api/route`, `/api/transit`, `/api/places`, `/api/places/search` |
| 지도 | 카카오맵 JS SDK, CustomOverlay 핀·폴리라인·화살표 직접 그림 |
| 폴링 | 온보딩 이후 2분(`FLIGHT_POLL_INTERVAL_MS`)마다 항공편 재조회 |

## 수치 — 상수 (레거시 이름 그대로, 2단계에서 `constants.ts`로 이동)
| 이름 | 값 | 줄 | 의미 | 검증 |
|---|---|---|---|---|
| `SECURITY_BUFFER_MIN` | 50분 | 354 | 수속(보안검색+출국심사) 폴백값 | 미검증 |
| `GATE_CUTOFF_MIN` | 30분 | 355 | 게이트 마감 버퍼(출발 20분 전 마감 + 여유) | 미검증 |
| `MIN_STAY` | 60분 | 356 | 이보다 적게 남으면 외출 불가 | 미검증(기획값) |
| `LAYOVER_BUDGET` | 360분 | 352 | 연결편 미조회 시 고정 체류 예산 | 기획값 |
| `DEFAULT_ARRIVE` | 10:30 | 351 | 도착편 미조회 시 데모 도착 시각 | 데모 |
| `PREP` | 20분 | 1381 | 짐 맡기기/준비 (코스·예약에서만 사용) | 미검증 |
| `CHECKIN_SLOT_STEP` / `COUNT` | 30분 / 6개 | 1013 | 체크인 시각 후보 | 기획값 |
| `WALK_MAX_KM` / `TRANSIT_MIN_KM` | 1.2 / 6 km | 417 | 이동수단 분기(직선거리) | 기획값 |
| `WALK_SPEED_KMH` | 4.5 | 419 | 도보 추정 속도 | 미검증 |
| (인라인) 실시간 장소 임시 이동시간 | 직선km × 2분 | 1685 | ≈30km/h 가정 | 미검증 |

## Time-Safe
레거시 식 (`connectionInfo`, 361–365줄 / 564–566줄):
```
buffer      = securityBuffer + GATE_CUTOFF_MIN
securityBuffer = (연결편 터미널 == P01 && 실시간 조회 성공) ? T1 전체 게이트 평균 대기(분, 반올림) : SECURITY_BUFFER_MIN
연결편 없음 → returnBy = arrive + LAYOVER_BUDGET, canGoOut = true
연결편 있음 → canGoOut = (depart − buffer − arrive) ≥ MIN_STAY
              returnBy  = canGoOut ? depart − buffer : arrive   (외출 불가면 체류 0)
표시 체류시간 = returnBy − arrive
```
- 도착 시각 = 실시간 예상(`estimatedDateTime`) 우선, 없으면 예정.
- 출발 시각 = 실시간 예상이 예정보다 **이르면 예정으로 올림**(조기 출발은 믿지 않음).

검산: 사용자 예시 4h21m(261분) − 50 − 30 = 181분 = **3h01m** → 레거시 식과 일치(폴백 50분일 때).

## Time-Fit
레거시 식 (`computeUsed` 1747–1755, 타임라인 1779–1798):
```
BUDGET = returnBy − arrive          (= Time-Safe 체류시간)
used   = PREP + move(공항→숙소)
       + Σ (move(숙소→장소ᵢ) + durᵢ)
       + (장소 있으면 move(숙소→마지막 장소) 아니면 move(공항→숙소))   ← 복귀 구간
remain = BUDGET − used, over = remain < 0
```
- 숙소 체류(휴식)는 예산에 넣지 않는다(의도).
- 장소 카드 "환승 내 가능" = 지금 일정에 그 장소를 더했을 때 `used ≤ BUDGET`.
- 자동 추천(`autoBuild`): 카테고리를 온보딩 관심사 순으로 정렬 → 카테고리마다 `move+dur`가 가장 작은 장소부터 보며 **들어가는 첫 장소 1곳**만 담는 탐욕법.
- `move`는 실측(카카오/ODsay/도보 추정) 우선, 실패 시 데이터의 더미값.

## 데이유즈 가격
레거시 식 (`roomHourTiers` 980–987, `Booking` 1015–1029):
```
stepPrice  = round(price / hourMin × 0.5 / 1000) × 1000      (1시간 추가당 가격)
tier(h)    = price + (h − hourMin) × stepPrice,  h = hourMin..hourMax
earliestCheckIn = arrive + PREP + room.move
슬롯 = ceil(earliestCheckIn / 30) × 30 부터 30분 간격 6개
기본 tier = (returnBy − checkIn) 안에 들어가는 가장 긴 tier, 없으면 최소 tier + "체크아웃이 복귀 시각 이후" 경고
```
예: 호텔 오라(50,000원, 3–9h) → stepPrice 8,000 → 3h 50,000 · 4h 58,000 · … · 9h 98,000원.
수수료(12%/15%/CPC)는 **레거시에 코드 없음**.

## 공식과 어긋나거나 모호한 부분 (확인 필요 · 수정 안 함)
| # | 영역 | 내용 | 영향 |
|---|---|---|---|
| A1 | Time-Safe | 예시의 "입국심사 50분"과 코드의 50분은 의미가 다르다. 코드는 **출국 쪽 수속(보안검색+출국심사)**이다. 도착 후 **입국심사·수하물 시간은 Time-Safe에 전혀 없다**. | 차감 항목 정의 |
| A2 | Time-Safe | **자정 넘김 미처리.** 시각을 0–1439분으로만 파싱해서 22:00 도착 → 익일 01:30 출발이면 `depart − arrive`가 음수 → "외출 불가"로 나온다. | 버그 가능성 높음 |
| A3 | Time-Safe | T1 실시간 대기시간이 50분을 **통째로 대체**한다(전 게이트 평균, 조회 시점 기준). 평균 10분이면 버퍼가 40분으로 줄어든다. 복귀 시점의 대기시간이 아니고 출국심사 시간도 빠진다. | 버퍼 과소 추정 |
| A4 | Time-Safe | **숙소→공항 이동시간이 복귀 버퍼에서 빠져 있다**(코드 562–565줄 주석). README는 "포함"이라고 설명 — 문서와 코드 불일치. 이동시간은 Time-Fit 쪽 복귀 구간으로만 반영된다. | 문서/정의 |
| A5 | Time-Safe ↔ Time-Fit | `PREP` 20분은 Time-Safe에 안 들어가고 코스 예산에서만 빠진다. 홈엔 3h01m인데 코스에선 실제로 2h41m부터 시작. | 사용자에게 보이는 숫자 불일치 |
| A6 | Time-Fit | 장소 간 이동을 모두 "숙소→장소"로 계산하고, 복귀 구간도 "숙소→마지막 장소" 시간을 재사용한다(장소→공항 아님). | 예산 부정확 |
| A7 | Time-Fit | 버튼 문구는 "OR-Tools 최적화"인데 실제는 카테고리당 1곳 탐욕법. | 문구/기능 불일치 |
| A8 | UI 문구 | "Time-Safe 알림 · 여유 30분", "복귀 30분 전 푸시 알림 예약됨" — 계산·기능 없음. | 문구만 존재 |
| A9 | 데이유즈 | 기획은 3~9시간인데 10곳 중 9곳은 `hourMax` 6. 시간당 추가 요금 규칙(기본가/기본시간 × 0.5)은 근거 없음. README는 "남는 시간 기반 가변 블록"이라 설명 — 코드는 정시간 tier로 바뀜. | 미검증 + 문서 불일치 |
| A10 | 데이유즈 | `earliestCheckIn`은 실측이 아닌 정적 `room.move`를 쓴다(코스 화면은 실측 사용). | 화면 간 값 차이 |
| A11 | 데이터 | 숙소 요금·평점·리뷰수, 장소 체류시간·요금, 짐 케어 가격(₩7,000/₩12,000)은 추정치. | 미검증 표시 필요 |
| A12 | 데이터 | 기본 입력 편명이 `OZ117`/`OZ511`로 하드코딩(TODO: 테스트 후 ""로). | 이식 시 제거 여부 |
| A13 | 디자인 | 앱 팔레트(Blue/Gold)와 `logo/README.md` 브랜드 컬러(Teal/Coral)가 다르다. | 토큰 기준 |

## 결론
- 계산 로직은 Time-Safe 1개 함수 + 코스 예산(2곳 중복) + tier 가격 1개로 작고, 순수 함수로 떼어내기 쉽다.
- A1·A2·A5는 2단계 Time-Safe 공식을 확정하기 전에 결정이 필요하다.

## 다음 할 일
- [ ] A1·A2·A3·A4·A5 결정 후 `formulas/time-safe.md` 작성 → `domain/time-safe.ts` + 테스트
- [ ] A6·A7 결정 후 `formulas/time-fit.md`
- [ ] A9 결정 후 `formulas/dayuse-pricing.md`
