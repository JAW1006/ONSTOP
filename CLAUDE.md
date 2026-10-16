# TimeStay — 작업 규칙

인천공항 환승 외국인을 위한 데이유즈 + AI 큐레이션 앱. 레거시 단일 HTML(`app/index.html`)을 React로 이식 중.
문서 목차: [docs/README.md](docs/README.md) · 진행·결정 필요: [docs/STATUS.md](docs/STATUS.md) · 용어: [docs/GLOSSARY.md](docs/GLOSSARY.md)

## 스택 / 명령어
Vite + React + TypeScript · Tailwind v4 + shadcn/ui(Radix) · React Router · TanStack Query · Vitest

| 명령 | 용도 |
|---|---|
| `npm run dev` | 개발 서버 (`/api` → `localhost:3001` 프록시) |
| `cd server && npm start` | API 프록시(인천공항·카카오·ODsay) — dev 전에 켜둔다 |
| `npm test` | Vitest |
| `npm run build` | 타입체크 + 빌드 |

## 폴더 책임
| 경로 | 규칙 |
|---|---|
| `src/domain/` | 순수 함수 + `*.test.ts`. **React·fetch·DOM import 금지.** |
| `src/domain/constants.ts` | 모든 상수(버퍼·수수료율 등)의 유일한 위치. md도 같은 이름으로 참조. |
| `src/features/<기능>/` | 화면·훅·API 호출. 계산은 domain을 호출만 한다. |
| `src/components/ui/` | shadcn/ui 기반 공통 컴포넌트. 비즈니스 로직 없음. |
| `src/styles/tokens.css` | 디자인 토큰. 원본 표는 `docs/design/design-tokens.md`. |
| `src/app/` | 라우팅·레이아웃·탭바. |
| `legacy/` | 이식 완료된 기존 HTML/JS 보관(5단계에 이동). 수정 금지. |
| `server/` | Express API 프록시. 이번 마이그레이션 범위 밖. |

## 반드시 지킬 규칙
1. **공식의 단일 출처는 `docs/formulas/*.md`.** 공식 수정 시 md를 먼저 갱신하고, 같은 변경에서 `src/domain` 코드와 테스트를 함께 고친다.
2. 테스트의 입력·기댓값은 공식 md의 "예시" 표와 **같은 숫자**를 쓴다.
3. 새 화면은 `docs/design/screens/<화면>.md`에 명세를 먼저 쓴다.
4. 화면 하나를 옮길 때마다 screens 명세 + `docs/results/YYYY-MM-DD-<주제>.md` + `docs/changelog.md`를 함께 남긴다.
5. 의미 있는 변경은 `docs/changelog.md`에 한 줄 남긴다.
6. 숫자에는 출처와 기준 연도를 붙인다. 검증 안 된 값은 **"미검증"**으로 표시한다.
7. 레거시 코드에서 공식과 어긋나거나 모호한 부분은 임의로 고치지 말고 사용자에게 먼저 묻는다.
8. 화면 문구·코드 이름은 GLOSSARY 용어를 따른다(예: "외출 가능 시간" = `outingMin`, "코스 가용 시간" = `courseAvailableMin`).
9. 토큰에 없는 색·반경·그림자를 하드코딩하지 않는다. 필요하면 tokens.css와 design-tokens.md에 먼저 추가.

## 문서 규칙
- 모든 문서 상단: `> 상태: 초안 | 확정 | 폐기` (+ 최종 수정일)
- 짧게, 표와 예시 위주.
- 템플릿
  - 공식: 정의 / 변수 표 / 예시(테스트와 동일) / 엣지 케이스 / 변경 이력
  - 결과: 목표 / 방법 / 수치 / 결론 / 다음 할 일
  - ADR: 배경 / 결정 / 대안 / 결과
