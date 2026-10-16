# 인천공항 여객편 운항현황(다국어) — 도착·출발

> 상태: 초안 · **미검증** — 사용자가 서버 키로 찍은 실제 로그를 받으면 "확정"으로 갱신

## 요청
| 용도 | 업스트림 | 앱 프록시 |
|---|---|---|
| 도착 | `apis.data.go.kr/B551177/StatusOfPassengerFlightsOdp/getPassengerArrivalsOdp` | `GET /api/flight/arrival?flightId=&lang=` |
| 출발 | `.../getPassengerDeparturesOdp` | `GET /api/flight/departure?flightId=&lang=` |

파라미터: `serviceKey`, `flight_id`, `lang`(K/E/C/J), `type=json`. 당일 운항편만 조회됨(README).

## 필드 (server.js 매핑 기준, 미검증)
| 업스트림 | 프록시 | 현재 가정 형식 | 확인 필요 |
|---|---|---|---|
| `scheduleDateTime` | `scheduleDateTime` | `HHMM` (README 예시 `"2005"`) | **12자리 `YYYYMMDDHHMM`인지** — 날짜 처리(A2)가 여기에 달림 |
| `estimatedDateTime` | `estimatedDateTime` | `HHMM` | 위와 동일, 빈 값일 때 형태 |
| `terminalId` | `terminal` | `P01`/`P02`/`P03` | 코드 의미(README 예시엔 `P02`) |
| `gatenumber` | `gate` | 문자열 | — |
| `airport` | `fromAirport` / `toAirport` | 현지화된 공항명 | — |
| `remark` | `remark` | 운항 상태 문자열 / null | 값 목록 |
| `carousel`(도착) / `chkinrange`(출발) | 동일 | 문자열 | — |

## 앱 공식에 주는 영향
- 날짜가 포함되면 [time-safe.md](../formulas/time-safe.md) A2의 "날짜로 계산" 경로가 실제로 동작하고, 24시간 초과 경고가 의미를 갖는다.
- `HHMM`만 오면 "출발 < 도착이면 익일" 규칙만 쓰인다.

## 응답 샘플
_로그 수신 후 원문 기록_
