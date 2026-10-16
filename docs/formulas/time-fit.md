# Time-Fit — 코스 가용 시간과 자동 추천

> 상태: 초안 · 최종 수정 2026-10-16
> 코드: [`src/domain/time-fit.ts`](../../src/domain/time-fit.ts), [`travel.ts`](../../src/domain/travel.ts) · 테스트: [`time-fit.test.ts`](../../src/domain/time-fit.test.ts) · 용어: [GLOSSARY](../GLOSSARY.md)

## 정의

### 기존 동작 (레거시 `Course` 1747–1798줄, `SavedCourseScreen` 1990–2010줄 — 같은 식 중복)
```
BUDGET = returnBy − arrive                         (= Time-Safe 표시값)
used   = PREP + roomMove
       + Σ (moveᵢ + durᵢ)                          (moveᵢ = 숙소→장소ᵢ)
       + (장소 있으면 move_last, 없으면 roomMove)  (복귀 구간)
remain = BUDGET − used,  over = remain < 0
```

### 결정된 공식
| 이슈 | 결정 | 적용 |
|---|---|---|
| A5 | 예산 = **코스 가용 시간** = 외출 가능 시간 − `COURSE_PREP_MIN`. 코스 사용 시간에서 준비를 뺀다. 남는 분은 기존과 같다. | **적용** |
| 요약 표기 | 일정 요약 "사용 X / 가용 Y" = (이동 + 체류 + 준비) / 외출 가능 시간 — (b) | **적용** (`scheduleSummary`) |
| A6 | 장소 간 이동·복귀 구간 계산 방식 | **결정 필요** ([STATUS](../STATUS.md)) |

#### 현재 공식
```
코스 가용 시간 available = max(0, 외출 가능 시간 − COURSE_PREP_MIN)
코스 사용 시간 used      = roomMove + Σ (moveᵢ + durᵢ) + (장소 있으면 move_last, 없으면 roomMove)
remain = available − used,  over = remain < 0
"환승 내 가능" = (담겨 있으면 현재 일정, 아니면 일정 + 그 장소)의 used ≤ available

일정 요약(화면 표기): 사용 = used + COURSE_PREP_MIN, 가용 = 외출 가능 시간, 여유 = 가용 − 사용 (= remain)

타임라인: 공항 밖 시각 → +COURSE_PREP_MIN → +roomMove(체크인) → 장소마다 +move(도착) +dur(출발) → +복귀 구간
```
- 숙소 체류(휴식)는 넣지 않는다(의도: 숙소는 거점).
- `move`는 실측 우선, 실패 시 데이터 더미값.

**자동 추천(`autoBuild`, 탐욕법 — 기존 동작 그대로)**
1. 선택 카테고리(없으면 `ACT_KEYS`)를 온보딩 관심사 순서로 정렬(관심사에 없는 건 뒤로, 같은 순위는 원래 순서).
2. 카테고리마다 `move + dur` 오름차순으로 보며, 지금까지 고른 일정에 더해도 `used ≤ available`인 **첫 장소 1곳**을 담는다.

**이동시간 (기존 동작 그대로)**
| 직선거리 | 수단 | 분 |
|---|---|---|
| ≤ `WALK_MAX_KM` | 도보(추정) | `max(1, round(km ÷ WALK_SPEED_KMH × 60))` |
| ≥ `TRANSIT_MIN_KM` | ODsay 대중교통, 실패 시 자동차 | `max(1, round(durationMin))` |
| 그 사이 | 카카오모빌리티 자동차 | `max(1, round(durationSec ÷ 60))` |
| 실측 전 실시간 장소 | 임시값 | `max(1, round(km × LIVE_PLACE_MIN_PER_KM))` |

## 변수 표
| 이름 | 값 | 단위 | 출처 | 검증 |
|---|---|---|---|---|
| `COURSE_PREP_MIN` | 20 | 분 | 레거시 코드 `PREP`("짐 맡기기/준비") | 미검증 |
| `ACT_KEYS` | Food, Massage, Shopping, Beauty, Sightseeing, Brand | — | 레거시(Rest 의도적 제외) | — |
| `WALK_MAX_KM` | 1.2 | km | 레거시 코드 | 기획값 |
| `TRANSIT_MIN_KM` | 6 | km | 레거시 코드 | 기획값 |
| `WALK_SPEED_KMH` | 4.5 | km/h | 레거시 코드 | 미검증 |
| `LIVE_PLACE_MIN_PER_KM` | 2 (≈30km/h) | 분/km | 레거시 코드 | 미검증 |

## 예시 (테스트와 동일, 레거시 데이터 값)
숙소 = 호텔 오라(공항→숙소 16분). 더풋샵 13/60, 원보만두 40/45 (move/dur). 예산은 **직접 넣는 입력값**이다: 외출 가능 181(= 레거시 버퍼 기준 3h01m) → 코스 가용 161. 현재 기본 버퍼(50/50/30)에선 #1 항공편이 외출 가능 131 → 코스 가용 111이 된다.

| # | 입력 | 기존 동작 (BUDGET 181, PREP 포함) | 현재 (가용 161, 준비 제외) |
|---|---|---|---|
| 1 | 숙소만 | used 52 | used **32** |
| 2 | 숙소 + 더풋샵 | used 122, 여유 59 | used **102**, 여유 59 |
| 3 | 숙소 + 원보만두 + 더풋샵 | used 207, 26분 초과 | used **187**, 26분 초과 |
| 4 | 숙소·장소 없음 | used 20 | used **0** |
| 5 | 공항 밖 10:30, #2 타임라인 | 체크인 11:06 → 더풋샵 11:19–12:19 → 복귀 12:32 | 같음 |
| 6 | 관심사 [쇼핑, 휴식], 선택 [맛집, 쇼핑], 후보 쇼핑 3·맛집 3 | 예산 181 → 다이소(13/30), 7곡제면소(16/45), used 156 | 가용 161 → 같은 선택, used **136** |
| 7 | #6을 기존 예산 100 / 가용 80으로 | 다이소만 | 다이소만 |
| 8 | 공항↔호텔 오라 | 3.1625km → 자동차 | 같음 |
| 9 | 더풋샵↔올리브영 0.12km | 도보 2분 | 같음 |
| 10 | 외출 가능 181 | — | 코스 가용 **161** |
| 11 | 외출 가능 181, 숙소 + 더풋샵 | — | 요약 **사용 2h02m / 가용 3h01m**, 여유 59 |

## 엣지 케이스
| 상황 | 처리 |
|---|---|
| 외출 불가(외출 가능 0) | 코스 가용 0 |
| 숙소 미선택 | 자동 추천 버튼 비활성, used 0 |
| 장소 간 이동 | 실제 동선이 아니라 각 장소의 숙소→장소 시간(A6) |
| 복귀 구간 | 마지막 장소의 숙소→장소 시간을 재사용(장소→공항 아님, A6) |
| 카테고리당 1곳 | 자동 추천은 시간이 남아도 카테고리당 1곳만 |
| 버튼 문구 "OR-Tools 최적화" | 실제는 탐욕법(A7, [STATUS](../STATUS.md)) |

## 변경 이력
| 날짜 | 변경 |
|---|---|
| 2026-10-16 | 기존 동작 이식 + 고정 테스트 |
| 2026-10-16 | 일정 요약 (b): `scheduleSummary` 추가(#11) |
| 2026-10-16 | A5 적용: 코스 가용 시간 도입, `PREP`→`COURSE_PREP_MIN`, used에서 준비 제외(남는 분 동일), 타임라인 시작 = 공항 밖 시각, `budgetMin`→`availableMin` |
