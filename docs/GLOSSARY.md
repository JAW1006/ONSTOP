# 용어집

> 상태: 초안 · 최종 수정 2026-10-19
> 화면 문구·코드 이름·문서가 같은 말을 쓰도록 여기서 정의한다. 시각·시간 단위는 분, 시각은 도착일 0시 기준.
> 이름 규칙(폴더·함수·단위 접미사 등)의 단일 출처는 [conventions.md](conventions.md) — 여기는 **그 용어가 가리키는 개념**을 정의한다.

## 시간
| 용어 | 정의 | 코드 이름 | 공식 |
|---|---|---|---|
| **외출 가능 시간** | 공항 밖 시각(도착 + 입국심사)부터 공항 복귀 추천 시각까지의 시간. **Time-Safe의 결과.** 홈·온보딩에 표시하고, 일정 요약의 "가용"으로도 쓴다. 준비 시간은 빼지 않는다. 외출 불가면 0. | `outingMin` / `scheduleSummary().availableMin` | [time-safe](formulas/time-safe.md) |
| **코스 가용 시간** | 외출 가능 시간 − 코스 준비(`COURSE_PREP_MIN`, 20분). 코스 빌더 예산과 "환승 내 가능" 판단 기준. | `courseAvailableMin()` | [time-fit](formulas/time-fit.md) |
| 코스 사용 시간 | 순차 경로(공항→숙소→장소들→숙소→공항, B1)의 이동 합 + 체류 합. (레거시 별 모양: 공항→숙소 + Σ(숙소→장소 + 체류) + 복귀 구간.) **준비 제외** — 코스 가용 시간과 비교하는 내부 값. 화면 표기는 "사용 시간"(준비 포함)을 쓴다. | `courseUsedMin()` | [time-fit](formulas/time-fit.md) |
| 남는 시간 / 초과 | 코스 가용 시간 − 코스 사용 시간. 음수면 초과. | — | [time-fit](formulas/time-fit.md) |
| **사용 시간** | 일정 요약 "**사용 X** / 가용 Y"의 X = 이동 + 체류 + **준비**(`COURSE_PREP_MIN`). 코스 사용 시간 + 20분. | `scheduleSummary().usedMin` | [time-fit](formulas/time-fit.md) |
| 일정 요약 | "사용 X / 가용 Y" — X = 사용 시간, Y = 외출 가능 시간. Y − X = 남는 시간(코스 가용 − 코스 사용과 같은 값). 2026-10-16 결정 (b) | `scheduleSummary()` | [time-fit](formulas/time-fit.md) |
| 총 환승 시간 | 도착 ~ 연결편 출발. 버퍼를 빼기 전. | `totalConnectionMin` | [time-safe](formulas/time-safe.md) |
| 공항 밖 시각 | 도착 + 입국심사 버퍼. 외출 가능 시간의 시작점. | `exitAtMin` | [time-safe](formulas/time-safe.md) |
| 공항 복귀 추천 시각 | 연결편 출발 − 복귀 버퍼. 외출 불가면 공항 밖 시각. | `returnByMin` | [time-safe](formulas/time-safe.md) |
| 외출 불가 | 연결편 출발 − 복귀 버퍼 − 공항 밖 시각 < `MIN_STAY`(60분). | `canGoOut = false` | [time-safe](formulas/time-safe.md) |
| **체크인 슬롯** | 고객이 고른 체크인 시각(분). 2026-10-19 전에는 함수마다 `checkInMin`(옛 타이어 로직)과 `slotMin`(상품·견적 로직)으로 갈려 있었다 — **`checkInMin`으로 통일**(컨벤션 불일치 #2 해소). `alignCheckIn`·`productStartsAt`·`defaultProduct`·`blockEndMin`·`bookingCheck`가 전부 이 이름으로 받는다 | `checkInMin` | [dayuse-pricing](formulas/dayuse-pricing.md) |
| 이동(분) | 숙소→장소, 공항→숙소처럼 한 구간을 이동하는 데 걸리는 분. 2026-10-19 전에는 `CourseStop.move`/`Place.move`처럼 단위 접미사가 없었다 — **`moveMin`으로 통일**(컨벤션 4장 단위 접미사 규칙, 불일치 #3 해소). 숙소→장소·공항→숙소 한 구간을 가리키는 변수는 `roomMoveMin`, 정렬용 임시값은 `rankMoveMin` | `moveMin`, `roomMoveMin`, `rankMoveMin` | [time-fit](formulas/time-fit.md) |
| 체류(분) | 장소에 머무는 분. 마찬가지로 접미사가 없던 `CourseStop.dur`/`Place.dur`를 **`durMin`으로 통일** | `durMin` | [time-fit](formulas/time-fit.md) |

## 버퍼
| 용어 | 정의 | 코드 이름 |
|---|---|---|
| ① 입국심사 버퍼 | 도착 후 입국심사 + 짐 찾기. 공항 밖 시각을 늦춘다. | `ARRIVAL_IMMIGRATION_MIN` |
| ② 출국 보안검색·출국심사 버퍼 | 공항 복귀 후 보안검색 + 출국심사. T1·T2 출국장 실시간 대기는 이 값의 하한 방식으로만 반영(탑승동 P02 제외). | `DEPARTURE_SECURITY_MIN` |
| ③ 게이트 여유 | 탑승 마감 전 게이트 도착 여유. | `GATE_MARGIN_MIN` |
| 복귀 버퍼 | ② + ③ | `returnBufferMin` |
| 코스 준비 | 짐 맡기기 등. **Time-Safe에는 넣지 않고** 코스 가용 시간·체크인 계산에서만 뺀다. | `COURSE_PREP_MIN` |

## 서비스
| 용어 | 정의 |
|---|---|
| Time-Safe | 항공편으로 외출 가능 시간을 계산하는 기능 |
| Time-Fit | 코스 가용 시간에 맞춰 코스를 추천하는 기능 |
| 데이유즈 | 숙박이 아닌 시간 단위 객실 이용 |
| 타임블록 | 데이유즈 정시간 상품(예: 3h, 4h …) |
| 거점 | 코스의 중심이 되는 데이유즈 숙소. 숙소 휴식 시간은 코스 사용 시간에 넣지 않는다. |
| 미검증 | 출처나 근거가 확인되지 않은 수치 |
