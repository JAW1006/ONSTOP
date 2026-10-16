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
| A9 | 3~9시간 범위·추가 시간 가격 규칙 | **결정 필요** ([STATUS](../STATUS.md)) |
| 수수료 계산식 | 적용 기준(객실가 / 결제가), 반올림 | **결정 필요** |

현재: `earliestCheckIn = exitAt + COURSE_PREP_MIN + roomMove` (exitAt = [time-safe](time-safe.md)의 공항 밖 시각). 입국심사 버퍼(현재 50분)만큼 기존보다 늦어진다(예: 10:30 도착 → 공항 밖 11:20 → 체크인 11:56 이후).

## 변수 표
| 이름 | 값 | 단위 | 출처 | 검증 |
|---|---|---|---|---|
| `TIER_STEP_RATIO` | 0.5 | 비율 | 레거시 코드(근거 없음) | 미검증 |
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
