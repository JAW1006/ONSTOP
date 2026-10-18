# 인천공항 여객편 운항현황(다국어) — 도착·출발

> 상태: **확정** · 확인일 2026-10-16 · 확인 방법: 공공데이터포털 개발계정 키로 업스트림 API 직접 호출(도착 1,201건·출발 1,217건 전수 집계) + 프록시 `/api/flight/*` 호출

## 요청

| 용도 | 업스트림                                                                      | 앱 프록시                                   |
| ---- | ----------------------------------------------------------------------------- | ------------------------------------------- |
| 도착 | `apis.data.go.kr/B551177/StatusOfPassengerFlightsOdp/getPassengerArrivalsOdp` | `GET /api/flight/arrival?flightId=&lang=`   |
| 출발 | `.../getPassengerDeparturesOdp`                                               | `GET /api/flight/departure?flightId=&lang=` |

파라미터: `serviceKey`, `flight_id`, `lang`(K/E/C/J), `type=json`. 당일 운항편만. `numOfRows`를 줘도 전체(약 1,200건)가 온다.

## 응답 샘플 (프록시, 키 없음)

```json
{
  "flights": [
    {
      "flightId": "OZ117",
      "airline": "아시아나항공",
      "fromAirport": "오사카/ 간사이",
      "scheduleDateTime": "0215",
      "estimatedDateTime": "0210",
      "terminal": "P03",
      "remark": "도착"
    }
  ]
}
```

```json
{
  "flights": [
    {
      "flightId": "SQ605Y",
      "airline": "SINGAPORE AIRLINES",
      "toAirport": "SINGAPORE",
      "scheduleDateTime": "0005",
      "estimatedDateTime": "2355",
      "gate": "30",
      "terminal": "P01",
      "checkInRange": "F01-G15",
      "remark": "출발"
    }
  ]
}
```

## 필드 형식

| 업스트림                              | 프록시                    | 형식(확인)                                 | 비고                                                |
| ------------------------------------- | ------------------------- | ------------------------------------------ | --------------------------------------------------- |
| `scheduleDateTime`                    | 같음                      | **`HHMM` 4자리, 날짜 없음** — 2,418건 전부 | A2: 날짜 경로는 현재 안 쓰임                        |
| `estimatedDateTime`                   | 같음                      | `HHMM` 4자리                               | 출발편 7건은 예정과 자정을 사이에 둠(00:05 → 23:55) |
| `terminalId`                          | `terminal`                | `P01` / `P02` / `P03`                      | 도착 290/183/728, 출발 281/188/748                  |
| `gatenumber`                          | `gate`                    | 문자열                                     | —                                                   |
| `airport`                             | `fromAirport`/`toAirport` | 현지화된 공항명(`lang`)                    | —                                                   |
| `remark`                              | `remark`                  | "도착"/"출발" 등                           | —                                                   |
| `carousel`(도착) / `chkinrange`(출발) | 같음                      | 문자열                                     | —                                                   |

업스트림에는 그 외 `typeOfFlight`, `codeshare`, `masterflightid`, `airportCode`, `cityCode`, `exitnumber`, 경유지(`firstopover` 등), `elapsetime`이 있다(프록시는 넘기지 않음).

## 터미널 코드

| 코드  | 의미                             | 출국장 실시간 대기                                                       |
| ----- | -------------------------------- | ------------------------------------------------------------------------ |
| `P01` | 제1여객터미널                    | T1 API                                                                   |
| `P02` | 탑승동(T1과 셔틀트레인으로 연결) | T1 API(출국 수속을 T1에서 함) — 셔틀 버퍼 미검증([STATUS](../STATUS.md)) |
| `P03` | 제2여객터미널                    | T2 API                                                                   |

## 관련: 여객편 주간 운항 현황

`StatusOfPassengerFlightsDSOdp`(주간 운항 현황)도 활용승인돼 있다(2026-08-09~2028-08-09). 날짜가 있는 미래 편 조회에 쓸 수 있으나 앱에서는 아직 사용하지 않는다(필드 미확인).
