# 데이유즈 가격·체크인·수수료

> 상태: 초안 · 최종 수정 2026-10-16
> 코드: [`src/domain/dayuse-pricing.ts`](../../src/domain/dayuse-pricing.ts) · 테스트: [`dayuse-pricing.test.ts`](../../src/domain/dayuse-pricing.test.ts)

## 정의

### 기존 동작 (레거시 `roomHourTiers` 980–987, `Booking` 1015–1029줄)
```
stepPrice = round(price ÷ hourMin × TIER_STEP_RATIO ÷ TIER_PRICE_ROUND_KRW) × TIER_PRICE_ROUND_KRW
tier(h)   = price + (h − hourMin) × stepPrice,   h = hourMin..hourMax (정시간 상품)

earliestCheckIn = arrive + PREP(20) + roomMove       (roomMove = 데이터의 정적 move)
slots           = ceil(earliestCheckIn ÷ CHECKIN_SLOT_STEP) × CHECKIN_SLOT_STEP 부터 CHECKIN_SLOT_COUNT개
defaultTier     = (returnBy − checkIn) 안에 들어가는 가장 긴 tier, 없으면 가장 짧은 tier
경고            = checkIn + hours × 60 > returnBy
```
수수료: 레거시 코드에 계산 없음(상수만 예약).

### 결정된 공식
| 이슈 | 결정 | 적용 |
|---|---|---|
| A5 | 가장 이른 체크인의 시작점 = 공항 밖 시각(도착 + 입국심사 버퍼), 준비는 `COURSE_PREP_MIN` | **적용** |
| A9 | 시간 범위·가격은 계산식으로 추정하지 않고 **호텔별 실제 판매 블록·가격표를 그대로** 쓴다 | **결정**(2026-10-16), 데이터 수집 중(인터뷰) — 구현은 예약 화면에서 |
| 수수료 계산식 | 적용 기준(객실가 / 결제가), 반올림 | **결정 필요** |

현재: `earliestCheckIn = exitAt + COURSE_PREP_MIN + roomMove` (exitAt = [time-safe](time-safe.md)의 공항 밖 시각). 입국심사 버퍼(현재 50분)만큼 기존보다 늦어진다(예: 10:30 도착 → 공항 밖 11:20 → 체크인 11:56 이후).


#### A9 — 결정된 방식: 호텔이 판매하는 블록·가격표를 그대로 쓴다 (2026-10-16 결정, 구현 전)
시간 범위·가격을 **계산식으로 추정하지 않는다**(`roomHourTiers`의 `TIER_STEP_RATIO` 0.5 식은 레거시 비교용으로만 남기고 화면에서 쓰지 않는다). 데이터는 인터뷰로 채운다([data-verification](../design/data-verification.md) "호텔별 시간 블록·가격 입력", [hotel-interview](../product/hotel-interview.md) 1장).

```ts
// 숙소마다(정적 데이터 → 이후 DB, ADR-0002)
interface DayuseOffer {
  products: DayuseProduct[];          // 비어 있으면 "예약 요청" 불가 → "가격 확인 중" 표시
  includes: ("shower" | "rest" | "luggage" | string)[];
  extension?: { allowed: boolean; pricePerHour?: number; note?: Localized };
  cancellation?: Localized;           // 호텔 규정 원문 요약(다국어)
  noShow?: Localized;
  requestResponse?: { typicalMinutes?: number; hours?: string }; // 확인 응답 시간·가능 시간대
  source: { date: string; method: "interview" | "contract" | "pricelist"; by: string };
}
interface DayuseProduct {
  hours: number;                      // 실제 판매 블록 길이(정수가 아닐 수도 있음 — 판매 그대로)
  price: number;                      // 판매가(원)
  vatIncluded: boolean;
  startWindow?: { from: string; to: string }; // 이 블록을 시작할 수 있는 시각("HH:MM")
  conditions?: Localized;             // 요일·기간·성수기 조건(구조화 전까지 글로)
}
```

| 계산 | 기존 동작(레거시) | 결정된 방식 |
|---|---|---|
| 상품 목록 | `hourMin..hourMax` 정시간, 가격 = 기본가 + (h − hourMin) × 기본가÷hourMin×0.5 | `products` **그대로**(빈 블록·불규칙 가격 허용) |
| 체크인 후보 | 가장 이른 체크인 이후 30분 간격 6개 | 같음 + 각 상품의 `startWindow` 밖이면 그 상품 비활성 |
| 기본 선택 | 복귀 전까지 들어가는 가장 긴 상품, 없으면 가장 짧은 상품 + 경고 | 같음(입력 목록 기준) |
| 가격 없음 | — | 상품이 없으면 예약 요청 버튼 대신 "가격 확인 중"(호텔 데이터 대기) |

domain 함수 변경(구현 시): `roomHourTiers(room)` → `offerProducts(offer)`(정렬·검증만), `defaultTier`·`isCheckoutPastReturn`은 그대로 재사용. 예시·테스트는 인터뷰로 받은 실제 가격표가 들어오면 그 값으로 쓴다(그 전에는 가상의 표로 구조만 테스트).

## 변수 표
| 이름 | 값 | 단위 | 출처 | 검증 |
|---|---|---|---|---|
| `TIER_STEP_RATIO` | 0.5 | 비율 | 레거시 코드(근거 없음) — **A9 결정으로 화면에서 쓰지 않음**(레거시 비교용) | 폐기 예정 |
| `TIER_PRICE_ROUND_KRW` | 1,000 | 원 | 레거시 코드 | — |
| `CHECKIN_SLOT_STEP` | 30 | 분 | 레거시 코드 | 기획값 |
| `CHECKIN_SLOT_COUNT` | 6 | 개 | 레거시 코드 | 기획값 |
| `DAYUSE_COMMISSION_RATE` | 0.12 | 비율 | 사업 계획(사용자 제공, 2026) | 미검증 |
| `ACTIVITY_COMMISSION_RATE` | 0.15 | 비율 | 사업 계획(사용자 제공, 2026) | 미검증 |
| `CPC_MIN_KRW` / `CPC_MAX_KRW` | 200 / 500 | 원/클릭 | 사업 계획(사용자 제공, 2026) | 미검증 |
| 숙소 `price`·`hourMin`·`hourMax` | 데이터 | — | 레거시 `ROOMS`(공개 예약 API 없음) | 미검증 |

## 예시 (테스트와 동일)
| # | 입력 | 기존 동작 결과 |
|---|---|---|
| 1 | 호텔 오라 50,000원, 3–9h | 추가 8,000원/h → 3h 50,000 · 4h 58,000 · … · 9h 98,000 |
| 2 | 웨스턴그레이스 43,000원, 3–6h | 7,166.67 → 7,000원/h → 43,000 · 50,000 · 57,000 · 64,000 |
| 3 | 공항 밖 10:30, 이동 16분 | 가장 이른 체크인 11:06 → 후보 11:30, 12:00 … 14:00 |
| 4 | 체크인 11:30, 복귀 13:31 (121분) | 들어가는 상품 없음 → 3h + 체크아웃 초과 경고 |
| 5 | 체크인 11:30, 복귀 18:20 (410분) | 6h, 경고 없음 |

## 엣지 케이스
| 상황 | 기존 동작 |
|---|---|
| 연결편 임박 | 최소 상품을 기본 선택하고 경고만 표시(결제는 가능) |
| 체크인 기준 이동시간 | 코스 화면은 실측, 예약 화면은 정적 `move` → 값이 다를 수 있음(A10) |
| `hourMax` | 10곳 중 9곳이 6h, 기획은 3~9h(A9) |

## 변경 이력
| 날짜 | 변경 |
|---|---|
| 2026-10-16 | 기존 동작 이식 + 고정 테스트 |
| 2026-10-16 | A5: 체크인 시작점을 공항 밖 시각으로, `PREP`→`COURSE_PREP_MIN` |
| 2026-10-16 | A9 결정: 호텔별 실제 판매 블록·가격표 구조(`DayuseOffer`), 계산식 폐기 예정 |
