# 진행 상태

> 상태: 확정 · 최종 수정 2026-10-16

## 단계
| 단계 | 내용 | 상태 |
|---|---|---|
| 1 | 프로젝트 세팅 + docs 뼈대 + 토큰 + CLAUDE.md | 완료 |
| 2 | domain 이식 + formulas md + Vitest | 진행 중 |
| 3 | 공통 UI 컴포넌트 + 탭바 | 대기 |
| 4 | 화면 이식 (Time-Safe → 홈 → 코스 지도 → 예약 → 짐 케어/마이) | 대기 |
| 5 | 레거시 비교 검증 후 `legacy/`로 이동 | 대기 |

## 결정됨 (적용 순서)
| # | 결정 | 공식 | 적용 |
|---|---|---|---|
| A2 | 자정 넘김: 날짜 우선, 없으면 출발 < 도착이면 익일, 24h 초과 경고 | [time-safe](formulas/time-safe.md) | 대기 |
| A3 | T1 실시간 대기: `max(기준값, 실시간)` | [time-safe](formulas/time-safe.md) | 대기 |
| A1 | 버퍼 3분할(입국심사 / 보안검색·출국심사 / 게이트 여유) | [time-safe](formulas/time-safe.md) | 대기 |
| A5 | 외출 가능 시간 / 코스 가용 시간 용어 분리 | [time-safe](formulas/time-safe.md), [time-fit](formulas/time-fit.md) | 대기 |

## 결정 필요
| # | 내용 | 근거 문서 |
|---|---|---|
| A1-값 | 버퍼 3개 구성 요소의 값과 합계 (입국심사: 기획서 50분 미검증 / 보안검색·출국심사: 코드 50분 미검증 / 게이트 여유: 코드 30분 미검증) | [time-safe](formulas/time-safe.md) |
| A6 | 코스 계산의 장소 간 이동(현재 숙소→장소)·복귀 구간(현재 마지막 장소 move 재사용) | [time-fit](formulas/time-fit.md) |
| A7 | 버튼 문구 "OR-Tools 최적화"(실제 탐욕법), "복귀 30분 전 푸시 알림 예약됨"·"여유 30분"(기능 없음) | [legacy-analysis](results/2026-10-16-legacy-analysis.md) |
| A9 | 데이유즈 3~9시간(데이터는 대부분 3–6h), 추가 시간 가격 규칙 `TIER_STEP_RATIO` 0.5 근거 | [dayuse-pricing](formulas/dayuse-pricing.md) |
| A10 | 예약 화면 체크인 계산이 실측이 아닌 정적 이동시간 사용 | [dayuse-pricing](formulas/dayuse-pricing.md) |
| A13 | 브랜드 컬러: 앱(Blue/Gold) vs 로고 README(Teal/Coral) | [design-tokens](design/design-tokens.md) |
| 수수료 | 수수료 계산 기준·반올림 | [dayuse-pricing](formulas/dayuse-pricing.md) |
| API | 공항 API `scheduleDateTime`에 날짜가 포함되는지(README 예시는 `HHMM`) — 실제 키로 미확인 | [time-safe](formulas/time-safe.md) |
| i18n | 5개 언어 문자열 이식 방식(라이브러리 여부) — 3단계 전 | [ADR-0001](decisions/ADR-0001-react-migration.md) |
