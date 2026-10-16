# 진행 상태

> 상태: 확정 · 최종 수정 2026-10-16

## 단계
| 단계 | 내용 | 상태 |
|---|---|---|
| 1 | 프로젝트 세팅 + docs 뼈대 + 토큰 + CLAUDE.md | 완료 |
| 2 | domain 이식 + formulas md + Vitest | 완료 |
| 3 | 공통 UI 컴포넌트 + 탭바 (+ 직전: i18n JSON 추출) | 완료 |
| 4 | 화면 이식 (Time-Safe → 홈 → 코스 지도 → 예약 → 짐 케어/마이) | 진행 중 — Time-Safe·홈 완료 |
| 5 | 레거시 비교 검증 후 `legacy/`로 이동 | 대기 |

## 브랜치·배포
| 항목 | 상태 |
|---|---|
| 작업 브랜치 | `migration/react-ts` (main 금지 — Render 자동 배포) |
| push | 가능 — 이 저장소만 `credential.https://github.com.username = JAW1006`(로컬 설정). `main`에는 올리지 않음 |
| 백업 | git bundle: `C:UsersOpenLinkONSTOP-backuponstop-migration-react-ts-2026-10-16.bundle` (`migration/react-ts` + `main`, 전체 이력). 복원: `git clone -b migration/react-ts <bundle> <폴더>` |

## 결정됨
| # | 결정 | 공식 | 적용 |
|---|---|---|---|
| A6 | 코스 계산을 순차 경로(공항→호텔→장소들→공항)로. 구간 캐시, 실패 시 근사 "약 N분". 기존 별 모양은 비교용으로 유지 | [time-fit](formulas/time-fit.md) | domain 적용, 화면은 코스 지도에서 |
| A7 | 자동 추천 설명 "OR-Tools 최적화 · …" → "시간에 맞춰 자동 추천 · 카테고리마다 남은 시간에 들어가는 장소를 1곳씩 담아요"(5개 언어, 미검수). 버퍼 안내 문구는 홈 이식 때 "예상 소요 반영 …"으로 이미 대체 | [i18n-review](design/i18n-review.md) | 적용 |
| 탑승동 | 탑승동(P02) 연결편에 T1 출국장 실시간 대기 적용(사용자 결정). 셔틀 버퍼는 미검증·미적용 | [time-safe](formulas/time-safe.md) | 적용 |
| T2 | 출국장 실시간 대기를 T1·T2 모두(`/api/security-wait/t2` 추가), 홈 배지는 터미널 기준 "T1/T2 실시간 확인 · 현재 N분" 또는 "실시간 아님" | [time-safe](formulas/time-safe.md), [api/incheon-congestion](api/incheon-congestion.md) | 적용 |
| 카카오맵 도메인 | `http://localhost:5173` 등록 완료(사용자, 2026-10-16). 이 주소에서 JS SDK 인증·지도 타일 로드 확인. 개발 서버 포트는 5173 고정(`strictPort`). `127.0.0.1`로는 열지 않는다(Vite가 localhost만 수신) | [api/environment](api/environment.md) | 확인 |
| ODsay 키 | 서버용 키 + 개발 PC 공인 IP 등록 후 `/api/transit` 정상(2026-10-16: 호텔 오라→원보만두 95분·2,800원, 웨스턴그레이스→원보만두 76분·3,700원). **배포 시 Render 서버 IP도 ODsay에 등록 필요** | [api/environment](api/environment.md) | 확인 |
| API 형식 | 항공편 시각은 `HHMM`만(날짜 없음) — 2026-10-16 실제 호출로 확인. A2 날짜 경로·24h 경고는 현재 API로는 쓰이지 않음 | [api/incheon-flights](api/incheon-flights.md) | 확인 |
| A2 | 자정 넘김: 날짜 우선, 없으면 출발 < 도착이면 익일, 24h 초과 경고 | [time-safe](formulas/time-safe.md) | 적용 (날짜 경로는 API 미검증) |
| A3 | T1 출국 실시간 대기: `max(기준값, 실시간)` | [time-safe](formulas/time-safe.md) | 적용 |
| A1 | 버퍼 3요소 구조 확정(입국심사 / 출국 보안검색·출국심사 / 게이트 여유), 기본값 50/50/30 | [time-safe](formulas/time-safe.md) | 적용 — **값은 미검증** |
| A5 | 외출 가능 시간 / 코스 가용 시간 용어 분리 | [GLOSSARY](GLOSSARY.md) | 적용 |
| 요약 | 일정 요약 "사용 X / 가용 Y" = (이동 + 체류 + 준비) / 외출 가능 시간 — (b) | [GLOSSARY](GLOSSARY.md), [time-fit](formulas/time-fit.md) | domain 적용(`scheduleSummary`), 화면은 코스 이식 때 |
| 외출 불가 CTA | 외출 불가면 "스마트 코스 추천" 비활성 + 이유 문구(레거시와 다름) | [screens/time-safe](design/screens/time-safe.md) | 적용 |
| 버퍼 표기 | 버퍼 구성 줄은 "예상/약"을 붙여 미확정임을 표시 | [screens/time-safe](design/screens/time-safe.md) | 적용 |
| i18n | react-i18next + 언어별 JSON(ko/en/zh/ja/vi), 의미 기반 키, ko→en 폴백, 키 타입 검사 | [ADR-0001](decisions/ADR-0001-react-migration.md), [키 대응표](design/i18n-keys.md) | 적용 (190개 추출) |

## 결정 필요
| # | 내용 | 근거 문서 |
|---|---|---|
| A1-값 | 버퍼 값 근거. 현재 ① `ARRIVAL_IMMIGRATION_MIN` 50(기획서) / ② `DEPARTURE_SECURITY_MIN` 50(레거시) / ③ `GATE_MARGIN_MIN` 30(레거시) — 전부 미검증. 입국 대기는 분 단위 공개 API 없음(인원 수만 제공) | [time-safe](formulas/time-safe.md), [조사](results/2026-10-16-arrival-wait-data.md) |
| 알림 기능 | 알림(푸시) 기능이 없어 다음 레거시 문구는 **새 화면에 쓰지 않는다**: `timeSafe.pushScheduled`("복귀 30분 전 푸시 알림 예약됨"), `course.step.return.sub`("Time-Safe 알림 · 여유 30분" — 코스 일정의 복귀 줄은 "복귀 도착 목표"로 대체), `confirm.alertOn`("알림 ON"), 마이의 `my.menu.timeSafeAlerts` 토글. 알림을 만들지, 문구를 지울지 결정 필요(키는 레거시 대조용으로 JSON에 남김) | [legacy-analysis](results/2026-10-16-legacy-analysis.md) |
| A9 | 데이유즈 3~9시간(데이터는 대부분 3–6h), 추가 시간 가격 규칙 `TIER_STEP_RATIO` 0.5 근거 | [dayuse-pricing](formulas/dayuse-pricing.md) |
| A10 | 예약 화면 체크인 계산이 실측이 아닌 정적 이동시간 사용 | [dayuse-pricing](formulas/dayuse-pricing.md) |
| A13 | 브랜드 컬러: 앱(Blue/Gold) vs 로고 README(Teal/Coral) | [design-tokens](design/design-tokens.md) |
| 수수료 | 수수료 계산 기준·반올림 | [dayuse-pricing](formulas/dayuse-pricing.md) |
| 탑승동 셔틀 버퍼 | 탑승동(P02, 게이트 101~132) 출발은 T1 출국장 통과 후 셔틀트레인을 탄다. 이 이동·대기에 별도 버퍼가 필요한지 **미검증** — 지금은 추가 버퍼 없음(게이트 여유 30분 안에 흡수된다고 가정, 근거 없음). 근거 후보는 아래 "탑승동 셔틀트레인 근거" | [time-safe](formulas/time-safe.md) |
| 신규 문구 번역 | 레거시 이후 추가한 키 5개 **미검수**(ko 원문·en·zh·ja·vi 한 표) | [i18n-review](design/i18n-review.md) |
| 입국 실시간 | 입국장 대기인원 → 분 환산(창구 수·처리량 가정 필요). 근거 확보 전 보류 권장 | [조사](results/2026-10-16-arrival-wait-data.md) |

## 탑승동 셔틀트레인 근거 (2026-10-16 조사, 전부 미검증)
| 내용 | 출처 | 확인 상태 |
|---|---|---|
| T1 ↔ 탑승동 셔틀트레인 **5분 주기** 운행 | 인천공항 공식 "탑승동 → 제1 여객터미널" 안내 [airport.kr/ap_ko/933](https://www.airport.kr/ap_ko/933/subview.do) | 검색 요약으로만 확인 — **원문 미확인**(페이지가 동적 로딩) |
| T1 → 탑승동 약 5분 소요, 24시간 운행, 탑승 후 터미널로 되돌아갈 수 없음 | 인천공항 영문 출국 안내 [airport.kr/ap_cnt/en/dep/process/deppro.do](https://airport.kr/ap_cnt/en/dep/process/deppro.do) | 검색 요약으로만 확인 — 원문 가져오기 실패 |
| 열차 주행 1분30초~1분50초, 05:00~22:30 구간별 2편성 | [이데일리 "공항24시" 셔틀트레인 기사](https://m.edaily.co.kr/News/Read?newsId=01302166622652264&mediaCodeNo=257) | 언론, 작성 시점이 오래돼 현재와 다를 수 있음 |
| 6분 간격 운행 | [위키백과 인천국제공항 셔틀트레인](https://ko.wikipedia.org/wiki/%EC%9D%B8%EC%B2%9C%EA%B5%AD%EC%A0%9C%EA%B3%B5%ED%95%AD_%EC%85%94%ED%8B%80%ED%8A%B8%EB%A0%88%EC%9D%B8) | 비공식, 공식 5분과 다름 |
| 승강장 이동·대기 포함 실제 소요 약 20분 | [나무위키 인천국제공항 셔틀트레인](https://namu.wiki/w/%EC%9D%B8%EC%B2%9C%EA%B5%AD%EC%A0%9C%EA%B3%B5%ED%95%AD%20%EC%85%94%ED%8B%80%ED%8A%B8%EB%A0%88%EC%9D%B8) | 비공식, 측정 근거 없음 |

정리: 열차 대기(최대 5~6분) + 주행(약 5분 이내)만 보면 10분 안팎, 승강장까지 걷는 시간을 포함하면 최대 20분이라는 비공식 설명도 있다. 공식 원문 확인 전까지 별도 버퍼는 넣지 않는다.

## 사용자 조치 필요
| # | 내용 |
|---|---|

## 자료 갱신 필요
| # | 내용 |
|---|---|
| 앱 화면 이미지 | 지원서·소개 자료의 앱 화면 캡처는 레거시(3시간 1분, 버퍼 구성 줄 없음, 외출 불가여도 CTA 활성) 기준이다. 새 화면(2시간 11분, "예상 소요 반영" 줄, 외출 불가 시 CTA 비활성)으로 **다시 캡처 필요** — 버퍼 값 확정 후 |
| 지원서 예시 | 지원서 이미지의 "4h21m − 입국심사 50분 − 게이트 30분 = **3h01m**" 예시가 현재 앱 기본값(50/50/30 → **2h11m**)과 맞지 않는다. 값 확정 후 이미지·문구 갱신 필요. 계산 비교는 [time-safe](formulas/time-safe.md) "합계 비교" |

## 개선 후보
| # | 내용 |
|---|---|
| 번들 크기 | 메인 JS 563KB(빌드 경고 기준 500KB 초과). 화면 이식이 끝난 뒤 라우트별 지연 로딩(`lazy`)으로 분할 |
| 로고 이미지 | `logo-mark.png` 405KB(30~40px로 표시) — 레거시와 같은 파일. 작은 PNG/SVG로 교체 검토 |

## 검증 부족
| # | 내용 | 계획 |
|---|---|---|
| 코스 계산·자동 추천 | `courseUsedMin`·`buildCourseTimeline`·`autoBuild`는 레거시가 컴포넌트 클로저 안에 있어 원본 함수와 자동 비교하지 못했다(손으로 따라간 값으로만 고정). 시간·거리·가격 함수는 레거시 원본과 약 1,400건 비교 일치. | **5단계**: 같은 입력(항공편·숙소·카테고리·관심사)으로 옛 화면과 새 화면의 일정·여유 분·자동 추천 결과 비교 |
