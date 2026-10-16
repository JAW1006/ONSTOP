# 인천공항 출국장 혼잡도 — T1 · T2

> 상태: **확정** · 확인일 2026-10-16 · 확인 방법: 공공데이터포털 개발계정 키로 업스트림 직접 호출 + 프록시 호출

## 요청
| 터미널 | 업스트림 | 앱 프록시 |
|---|---|---|
| T1(`P01`) | `apis.data.go.kr/B551177/statusOfDepartureCongestion/getDepartureCongestion` | `GET /api/security-wait` |
| T2(`P03`) | `apis.data.go.kr/B551177/statusOfDepartureCongestionT2/getDepartureCongestionT2` | `GET /api/security-wait/t2` |

파라미터: `serviceKey`, `type=json`, `numOfRows`. 같은 `AIRPORT_SERVICE_KEY`(API마다 활용신청, 둘 다 2026-09-18~2028-09-18 승인).

## 업스트림 응답 필드 (T1·T2 동일)
| 필드 | 예시 | 의미 |
|---|---|---|
| `gateId` | T1 `DG1_E`…`DG6_W`(12개) / T2 `DG1_A`…`DG2_D`(8개) | 출국장 게이트 |
| `terminalId` | `P01` / `P03` | 터미널 |
| `waitTime` | `"9"` | 대기시간(분, 문자열). 미운영이면 `""` |
| `waitLength` | `"341"` | 대기 인원(명) |
| `occurtime` | `"20261016123708"` | 측정 시각(`YYYYMMDDHHMMSS`) |
| `operatingTime` | `"05:30~19:00"` / `""` | 운영 시간 |
| `tmp1`~`tmp3` | `""` | 예비 |

## 프록시 응답 (T1·T2 동일 형식)
```json
{ "gates": [{ "gateId": "DG1_A", "waitTimeMin": 10, "waitLength": 332 }, { "gateId": "DG2_D", "waitTimeMin": 6, "waitLength": 91 }] }
```
`waitTime`이 빈 게이트는 제외. 앱은 `waitTimeMin` 평균(반올림)을 ② 보안검색·출국심사의 **하한**으로만 쓴다([time-safe](../formulas/time-safe.md) A3).

## 관측값(참고, 2026-10-16 12:43 KST 프록시 집계)
| 터미널 | 게이트 수 | 게이트별 대기 | 평균(앱이 쓰는 값) |
|---|---|---|---|
| T1 | 12 | 6~35분 | 18분 |
| T2 | 8 | 6~11분 | 9분 |

→ 둘 다 기준값 50분보다 작아 버퍼는 50분이 적용된다.
