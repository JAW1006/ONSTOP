# ADR-0001: 단일 HTML 프로토타입을 Vite + React + TS로 이식

> 상태: 확정 · 2026-10-16

## 배경
- 앱 전체가 `app/index.html` 한 파일(2,086줄)에 있다. CDN importmap + Babel Standalone으로 브라우저에서 JSX를 컴파일한다.
- 계산 로직(Time-Safe, 코스 예산, 타임블록 가격)이 컴포넌트 안에 섞여 있어 테스트가 없고, 같은 계산이 여러 곳에 복붙돼 있다(예: `Course`와 `SavedCourseScreen`의 일정 계산).
- 스타일은 전부 인라인 객체, 다국어 문자열(`STR`)·데이터(`ROOMS`, `PLACES`)도 같은 파일에 있다.
- README와 실제 코드가 어긋난 부분이 생겼다(복귀 버퍼에 숙소→공항 이동시간 포함 여부 등).

## 결정
| 항목 | 선택 |
|---|---|
| 빌드 | Vite |
| UI | React + TypeScript (strict) |
| 스타일 | Tailwind CSS v4 + shadcn/ui(Radix), 토큰은 `src/styles/tokens.css` |
| 라우팅 | React Router (탭·화면을 URL로) |
| 서버 상태 | TanStack Query (항공편 2분 재조회·이동시간 캐시) |
| 테스트 | Vitest — `src/domain` 순수 함수 우선 |
| 구조 | `domain`(계산) / `features`(화면) 분리, 공식 원본은 `docs/formulas` |
| API | 기존 `server/` Express 프록시 유지, Vite dev 프록시로 연결 |
| 레거시 | 이식 완료 후 `legacy/`로 이동(삭제 안 함) |

## 대안
| 대안 | 기각 이유 |
|---|---|
| 단일 HTML 유지 + 파일 분할 | 타입·테스트·번들 최적화 불가, Babel Standalone 런타임 비용 |
| Next.js | SSR 불필요(모바일 SPA), API는 이미 Express 프록시 존재 |
| CSS-in-JS 유지(인라인) | 토큰 일관성 관리 어려움, shadcn/ui와 결이 안 맞음 |
| 상태 관리 라이브러리(Redux 등) | 서버 상태는 Query, 나머지는 소규모라 Context로 충분 |

## 결과
- (+) 공식이 md ↔ 코드 ↔ 테스트로 추적 가능해진다.
- (+) 화면 단위 점진 이식 가능, 이식 중에도 레거시 `localhost:3001`은 그대로 동작.
- (−) 이식 기간 동안 두 앱 공존 → 화면별로 레거시와 비교 검증 필요(5단계).
- (−) 다국어(5개 언어) 문자열 이식 비용. i18n 방식은 3단계 전에 별도 결정 필요.
