# 용어집

> 상태: 초안 · 최종 수정 2026-10-16
> 화면 문구·코드 이름·문서가 같은 말을 쓰도록 여기서 정의한다. 시각·시간 단위는 분, 시각은 도착일 0시 기준.

## 시간
| 용어 | 정의 | 코드 이름 | 공식 |
|---|---|---|---|
| **외출 가능 시간** | 공항 밖으로 나간 뒤 공항 복귀 추천 시각까지의 시간. **Time-Safe의 결과, 홈·온보딩에 표시.** 준비 시간은 빼지 않는다. 외출 불가면 0. | `outingMin` | [time-safe](formulas/time-safe.md) |
| **코스 가용 시간** | 외출 가능 시간 − 코스 준비(`COURSE_PREP_MIN`, 20분). 코스 빌더 예산과 "환승 내 가능" 판단 기준. | `courseAvailableMin()` | [time-fit](formulas/time-fit.md) |
| 코스 사용 시간 | 공항→숙소 + Σ(숙소→장소 + 체류) + 복귀 구간. 준비 시간 제외. | `courseUsedMin()` | [time-fit](formulas/time-fit.md) |
| 남는 시간 / 초과 | 코스 가용 시간 − 코스 사용 시간. 음수면 초과. | — | [time-fit](formulas/time-fit.md) |
| 총 환승 시간 | 도착 ~ 연결편 출발. 버퍼를 빼기 전. | `totalConnectionMin` | [time-safe](formulas/time-safe.md) |
| 공항 밖 시각 | 도착 + 입국심사 버퍼. 외출 가능 시간의 시작점. | `exitAtMin` | [time-safe](formulas/time-safe.md) |
| 공항 복귀 추천 시각 | 연결편 출발 − 복귀 버퍼. 외출 불가면 공항 밖 시각. | `returnByMin` | [time-safe](formulas/time-safe.md) |
| 외출 불가 | 연결편 출발 − 복귀 버퍼 − 공항 밖 시각 < `MIN_STAY`(60분). | `canGoOut = false` | [time-safe](formulas/time-safe.md) |

## 버퍼
| 용어 | 정의 | 코드 이름 |
|---|---|---|
| ① 입국심사 버퍼 | 도착 후 입국심사 + 짐 찾기. 공항 밖 시각을 늦춘다. | `ARRIVAL_IMMIGRATION_MIN` |
| ② 보안검색·출국심사 버퍼 | 공항 복귀 후 보안검색 + 출국심사. T1 실시간 대기는 이 값의 하한 방식으로만 반영. | `DEPARTURE_SECURITY_MIN` |
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
