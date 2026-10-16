# 진행 상태

> 상태: 확정 · 최종 수정 2026-10-16

> 서비스 운영 계획: [product/roadmap](product/roadmap.md) (2026-10-16 공모전 종료, 실제 서비스 전환)

## 단계
| 단계 | 내용 | 상태 |
|---|---|---|
| 1 | 프로젝트 세팅 + docs 뼈대 + 토큰 + CLAUDE.md | 완료 |
| 2 | domain 이식 + formulas md + Vitest | 완료 |
| 3 | 공통 UI 컴포넌트 + 탭바 (+ 직전: i18n JSON 추출) | 완료 |
| 4 | 화면 이식 (Time-Safe → 홈 → 코스 지도 → 예약 → 짐 케어/마이) | 진행 중 — Time-Safe·홈·코스 지도 완료 |
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
| A6 | 코스 계산을 순차 경로(공항→호텔→장소들→공항)로. 구간 캐시, 실패 시 근사 "약 N분". 기존 별 모양은 비교용으로 유지 | [time-fit](formulas/time-fit.md) | 적용(코스 지도) |
| 코스 색·선 | 체류 연한 파랑, 코스 화면 카테고리 배지 회색+아이콘·글자, 청록은 임시(역할 토큰 `--ts-role-route`), 선 모양으로 수단 구분 | [design-tokens](design/design-tokens.md) | 적용 |
| 요약 패널 | 지도 아래 고정 | [screens/course-map](design/screens/course-map.md) | 적용 |
| ODsay 선택 필드 | `/api/transit`에 `distanceM`·`busTransitCount`·`subwayTransitCount`(있을 때만). 칩은 값이 없으면 시간만 | [api/environment](api/environment.md) | 적용 |
| 알림 문구 | 기능 없는 알림 문구 4개 삭제(`timeSafe.pushScheduled`, `course.step.return.sub`, `confirm.alertOn`, `my.menu.timeSafeAlerts`). 복귀 알림 방식은 [ADR-0006](decisions/ADR-0006-return-alert.md)에서 결정 | [i18n-review](design/i18n-review.md) "삭제한 레거시 키" | 적용 |
| 자동 추천 0곳 | 남은 시간에 들어가는 장소가 없으면 안내 문구(`course.autoBuild.empty`, 미검수) | [screens/course-map](design/screens/course-map.md) | 적용 |
| 근사값 | 기존 지시대로 유지: 구간 결과 캐시, 조회 중·실패 시 "약 N분". 정확도 보정은 로드맵 | [roadmap](product/roadmap.md) | 유지 |
| 번역 정책 | **공개 전 모든 번역(레거시 185 + 추가·변경 36)을 원어민 검수**. 검수 표 2개 유지 | [i18n-review](design/i18n-review.md), [i18n-review-legacy](design/i18n-review-legacy.md) | 진행 전 |
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
| 운영 ADR | DB(ADR-0002)·인증(0003)·결제·정산 구조(0004)·환경·배포(0005)·복귀 알림(0006) — 모두 초안 | [decisions/](decisions/) |
| 외부 API | 공공데이터 운영계정 전환, ODsay 등급(무료 30~1,000/일), 카카오모빌리티 쿼터·계약, 카카오 응답 저장 금지 준수 | [operations/external-apis](operations/external-apis.md) |
| 법률 | 체크리스트 전 항목 확인(결론 없음, 전문가 확인 필요) | [legal-checklist](legal-checklist.md) |
| 데이터 | 숙소·장소 미검증 값 116개 | [design/data-verification](design/data-verification.md) |
| A1-값 | 버퍼 값 근거. 현재 ① `ARRIVAL_IMMIGRATION_MIN` 50(기획서) / ② `DEPARTURE_SECURITY_MIN` 50(레거시) / ③ `GATE_MARGIN_MIN` 30(레거시) — 전부 미검증. 입국 대기는 분 단위 공개 API 없음(인원 수만 제공) | [time-safe](formulas/time-safe.md), [조사](results/2026-10-16-arrival-wait-data.md) |
| A9 | 데이유즈 3~9시간(데이터는 대부분 3–6h), 추가 시간 가격 규칙 `TIER_STEP_RATIO` 0.5 근거 | [dayuse-pricing](formulas/dayuse-pricing.md) |
| A10 | 예약 화면 체크인 계산이 실측이 아닌 정적 이동시간 사용 | [dayuse-pricing](formulas/dayuse-pricing.md) |
| A13 | 브랜드 컬러: 앱(Blue/Gold) vs 로고 README(Teal/Coral) | [design-tokens](design/design-tokens.md) |
| 수수료 | 수수료 계산 기준·반올림 | [dayuse-pricing](formulas/dayuse-pricing.md) |
| 탑승동 셔틀 버퍼 | 탑승동(P02, 게이트 101~132) 출발은 T1 출국장 통과 후 셔틀트레인을 탄다. 이 이동·대기에 별도 버퍼가 필요한지 **미검증** — 지금은 추가 버퍼 없음(게이트 여유 30분 안에 흡수된다고 가정, 근거 없음). 근거 후보는 아래 "탑승동 셔틀트레인 근거" | [time-safe](formulas/time-safe.md) |
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
| 카카오맵 JS 키 | 레포 루트에 `.env.local`을 만들고 `VITE_KAKAO_JS_KEY=<레거시 지도와 같은 앱의 JavaScript 키>`를 넣는다(`.env.example` 참고, git에 안 올라감). 비어 있으면 코스 화면 지도 자리에 안내 문구만 나온다 |
| 실제 지도 확인 | 아래 "실제 지도 확인 절차" |

## 실제 지도 확인 절차 (코스 지도)
테스트는 모의 지도로만 했다. 실제 카카오맵은 아래 순서로 확인한다.

**준비**
1. `server/.env`가 채워져 있는지 확인(키는 건드리지 않는다).
2. 레포 루트 `.env.local`에 `VITE_KAKAO_JS_KEY` 입력(위 "사용자 조치 필요").
3. 터미널 1: `cd server && npm start` (3001) · 터미널 2: `npm run dev` (5173 고정).
4. 브라우저로 **`http://localhost:5173`**(127.0.0.1 아님) → 온보딩에서 **오늘 실제 운항하는** 도착편·연결편 조회(당일 편만 조회됨) → 스마트 코스 추천 → 코스 탭.

**확인 항목**
| # | 확인 | 기대 |
|---|---|---|
| 1 | 지도가 뜨는가 | 안내 문구가 아니라 지도 타일. 실패하면 키 값, 도메인 등록(`http://localhost:5173`), 카카오맵 제품 활성화 순으로 확인 |
| 2 | 숙소를 고르기 전 | 공항(✈ 남색)과 호텔 10곳(작은 회색 H). 회색 H를 누르면 그 숙소가 선택된다 |
| 3 | 숙소 선택 후 | 선택 호텔은 금색 H + 이름, 공항→호텔 선 + 칩, 호텔→공항 **빨간 긴 파선** + "복귀" 칩 |
| 4 | 장소 2~3곳 추가 | 파랑 번호 핀 1·2·3, 구간이 공항→호텔→1→2→…→공항 순서로 이어짐. 칩 시간 합 = 요약 막대의 "이동 N분" |
| 5 | 선 모양 | 대중교통 굵은 실선, 택시 보통 실선, 도보 가는 점선, 복귀 빨간 긴 파선 — **도보 점선과 복귀 파선이 확실히 구분되는지** |
| 6 | 색 | 이동 선·칩은 모두 같은 청록(구간마다 색이 바뀌지 않음), 복귀만 빨강 |
| 7 | 칩 | 수단 아이콘 + 시간(크게) + 거리(작게, 실제 값일 때만). 근사 구간은 "약 N분" |
| 8 | 구간 선택 | 칩이나 선을 누르면 그 구간만 굵고 진하게, 나머지는 옅게 + 지도 아래 한 줄 정보. 다시 누르면 해제 |
| 9 | 확대 | 레벨 6 이하로 확대하면 후보·참고용 회색 점이 보이고, 점을 누르면 장소 상세 시트(참고용은 이름만) |
| 10 | 확대 중 화면 유지 | 장소를 넣고 빼도 확대해 보던 위치로 되돌아가지 않는다(숙소를 바꿀 때만 중심 이동) |
| 11 | 저장된 코스 | 저장 후 지도에 다른 호텔·후보 점 없이 코스만 보인다 |

결과는 `docs/results/YYYY-MM-DD-course-map-real.md`에 스크린샷과 함께 남긴다.

## 자료 갱신 필요
| # | 내용 |
|---|---|
| 앱 화면 이미지 | 지원서·소개 자료의 앱 화면 캡처는 레거시(3시간 1분, 버퍼 구성 줄 없음, 외출 불가여도 CTA 활성) 기준이다. 새 화면(2시간 11분, "예상 소요 반영" 줄, 외출 불가 시 CTA 비활성, 코스 지도 v2)으로 **다시 캡처 필요** — 버퍼 값 확정 후 |
| 지원서 예시 | 지원서 이미지의 "4h21m − 입국심사 50분 − 게이트 30분 = **3h01m**" 예시가 현재 앱 기본값(50/50/30 → **2h11m**)과 맞지 않는다. 값 확정 후 이미지·문구 갱신 필요. 계산 비교는 [time-safe](formulas/time-safe.md) "합계 비교" |

## 개선 후보
| # | 내용 |
|---|---|
| 번들 크기 | 메인 JS 605KB(빌드 경고 기준 500KB 초과, 코스 지도 이식 후). 화면 이식이 끝난 뒤 라우트별 지연 로딩(`lazy`)으로 분할 |
| 로고 이미지 | `logo-mark.png` 405KB(30~40px로 표시) — 레거시와 같은 파일. 작은 PNG/SVG로 교체 검토 |
| 근사값 정확도 | 구간 근사(직선 1km당 2분)가 실제 대중교통보다 크게 짧다(실측 예: 호텔 오라→차이나타운 ODsay 95분 vs 근사 약 36분). 자동 추천·"환승 내 가능"이 근사로 판정되면 실제 값이 들어온 뒤 초과로 바뀔 수 있음 → 자동 추천 전 후보 구간 미리 조회 또는 대중교통 근사 계수 보정 |
| 구간 상세 시트 | 칩 탭 시 한 줄 정보(수단·시간·거리·환승·요금)만 구현. 노선 단계별 안내 시트는 미구현 |
| 진행 방향 화살표 | 레거시의 선 위 화살표·구간 번호 배지는 옮기지 않음(칩으로 대체) |

## 검증 부족
| # | 내용 | 계획 |
|---|---|---|
| 실제 카카오맵 화면 | 코스 지도는 모의 지도로만 테스트 | 사용자 확인 — 위 "실제 지도 확인 절차" |

## 검증 완료
| # | 내용 | 근거 |
|---|---|---|
| 코스 계산·자동 추천 이식 | 레거시 화면을 같은 입력(항공편 3종 × 장소 0·1·3·자동 추천)으로 조작한 값 = 옮긴 레거시 함수 값. 새 화면과의 차이는 A1·A6로 모두 설명됨 | [results/2026-10-16-course-map-compare](results/2026-10-16-course-map-compare.md), `time-fit.test.ts` "레거시 화면 관측값" |
