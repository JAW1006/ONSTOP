# 인천공항 입국장 대기시간 데이터 조사

> 상태: 확정 · 2026-10-16 · 관련: [time-safe.md](../formulas/time-safe.md) ① `ARRIVAL_IMMIGRATION_MIN`

## 목표
입국심사 버퍼(①)를 고정값 대신 실시간 값으로 하한 적용(`max(기본값, 실시간)`)할 수 있는 공개 데이터가 있는지 확인한다.

## 방법
공공데이터포털(data.go.kr) 인천국제공항공사(B551177) 데이터셋 페이지와 언론 보도를 웹으로 조사했다. **실제 API 호출은 하지 않았다**(서버 키 없음) → 필드·동작은 페이지 설명 기준, 미검증.

## 수치

### 공개 데이터 후보
| 데이터셋 | 엔드포인트 | 제공 값 | 대기시간(분) | 범위·주기 | 승인·트래픽 |
|---|---|---|---|---|---|
| [입국장현황 정보 서비스](https://www.data.go.kr/data/15095061/openapi.do) (15095061) | `apis.data.go.kr/B551177/StatusOfArrivals/getArrivalsCongestion` | 도착편별 `flightid`, `entrygate`(입국장), `terno`, `scheduletime`, `estimatedtime`, **대기인원 `korean`·`foreigner`** | **없음** | 조회 시점 H−2~H+2, 실시간 | 개발 자동승인(일 500건), 운영 심의승인 |
| [승객예고-출·입국장별](https://www.data.go.kr/data/15095066/openapi.do) (15095066) | 페이지에 미표시(활용가이드 docx) | T1 입국장(동·서), **T1 입국심사(C·D)**, T2 입국장 1·2의 시간대별 **예상 승객 수** | **없음** | D+0, D+1 예측, 실시간 갱신 | 자동승인(개발 일 1,000건). 예상 혼잡도 대민 서비스는 **안내문구를 관리부서와 협의** 필요 |
| [출국장 혼잡도 조회](https://data.edmgr.kr/dataView.do?id=www-data-go-kr-data-openapi-15148225) (15148225) | 현재 사용 중(`/api/security-wait`) | 출국장별 대기시간·대기인원 | 있음(출국장만) | T1만 | — |

두 데이터셋 모두 등록 2021-11-23, 최종 수정 2026-08-06(페이지 기준). 2022-05-31 PUBC → GateWay 전환([공지](https://www.data.go.kr/bbs/ntc/selectNotice.do?originId=NOTICE_0000000002432)) 이후 명세 기준.

### 실제 대기 수준 참고 (언론, 미검증)
| 내용 | 출처 |
|---|---|
| 2026-08-05 T1 외국인 입국심사 최대 약 **80분** 대기(정오 도착 → 13:20 이후 통과), 서편 외국인 창구 20개 중 11개 운영 | [Korea Times, 2026-08-05](https://www.koreatimes.co.kr/southkorea/others/20260805/foreign-tourists-stuck-in-immigration-lines-for-up-to-80-minutes-at-incheon-intl-airport) (한국일보 기사 번역) |
| 도착 집중 시간대 입국 대기 1시간 초과 보도 | [Korea Herald](https://www.koreaherald.com/article/10830421) |
| ICAO 권고: 입국심사 대기 45분 이내 | 위 Korea Times 기사 인용 |
| 인천공항 자체 "출입국 혼잡 예측" 웹 화면(매일 17시 갱신) — 공개 API 여부 미확인 | [airport.kr](https://airport.kr/co/en/cpr/statisticPredictCrowdedOfInout.do) |

## 결론
1. **분 단위 입국 대기시간을 주는 공개 API는 찾지 못했다.** 출국장과 달리 입국 쪽은 대기 **인원**(실시간)과 예상 **승객 수**(예측)뿐이다.
2. 실시간 하한 적용을 하려면 인원 → 분 환산이 필요하다:
   `추정 대기(분) = 외국인 대기인원 ÷ (운영 창구 수 × 창구당 처리량)`
   창구 수·처리량은 공개 데이터에 없어 **가정값이 들어간다** → 지금 도입하면 "미검증 값으로 미검증 값을 덮는" 구조라 보류를 권장.
3. 도입한다면 출국 쪽과 같은 하한 방식 `max(ARRIVAL_IMMIGRATION_MIN, 추정 대기)`만 허용(값을 줄이는 방향 금지).
4. 기본값 50분은 ICAO 권고(45분)보다는 크지만 2026-08 보도된 성수기 최대치(약 80분)보다 작다. "보수적"인지는 시간대에 따라 다르다.

## 다음 할 일
- [ ] 서버 키로 `getArrivalsCongestion` 한 건 호출 → `docs/api/`에 실제 필드 기록(대기인원 단위·갱신 시각 확인)
- [ ] 승객예고 활용가이드(docx)에서 필드명 확인
- [ ] 창구당 처리량 근거(법무부·공사 자료) 확보 전까지 ① 실시간 적용 보류 — [STATUS](../STATUS.md)
