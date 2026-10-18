# TimeStay

인천공항 환승 외국인을 위한 데이유즈 + AI 큐레이션 앱. 도착부터 공항 복귀까지 남는 환승 시간(Time-Safe)에 맞춰 데이유즈 숙소·짐 보관·주변 액티비티를 자동으로 코스로 짜준다.

**설치·실행은 [SETUP.md](SETUP.md)를 본다.** 문서 전체 목차는 [docs/README.md](docs/README.md), 진행 상태·결정 필요 목록은 [docs/STATUS.md](docs/STATUS.md), 작업 규칙은 [CLAUDE.md](CLAUDE.md)·[AGENTS.md](AGENTS.md).

> 레거시 단일 HTML 프로토타입(`app/index.html`)을 Vite + React + TypeScript로 이식 중이다(작업 브랜치 `migration/react-ts`). 화면 이식은 진행 중 — 지금 실제로 돌리는 건 `src/`다. `app/`은 이식이 끝날 때까지 참고용으로 남아 있고, 그 안내는 [docs/legacy-readme.md](docs/legacy-readme.md)로 옮겼다.

## 폴더 구성

```
TimeStay/
├── src/                  # React 앱 (지금 실제로 돌리는 것)
│   ├── app/               # 라우팅·레이아웃·탭바
│   ├── domain/             # 순수 계산 함수(Time-Safe·Time-Fit·가격 등) + 테스트
│   ├── features/           # 화면·훅·API 호출(도메인은 domain을 호출만)
│   ├── components/ui/      # 공통 UI 컴포넌트(shadcn/Radix 기반)
│   ├── i18n/                # react-i18next, locales/*.json 5개 언어
│   └── styles/              # 디자인 토큰(tokens.css)·Tailwind 테마
├── server/                # Express: 외부 API 프록시 + 예약 요청 API(booking.js) + 관리자 화면
│   ├── server.js
│   ├── migrations/          # DB 스키마 단일 출처(*.sql, 이름순 적용)
│   └── .env.example          # 서비스키·DB·관리자 자격증명 템플릿
├── design/reference/      # 디자인 이식 참고 원본(Figma Make UI Kit) — 수정 금지
├── docs/                  # 공식·화면 명세·결정·API·진행 상태 문서
├── app/                   # 레거시 단일 파일 프로토타입 — 이식 원본, 수정하지 않는다
├── legacy/                # 이식 완료된 화면이 여기로 옮겨진다(지금은 비어 있음)
└── logo/                   # 브랜드 로고·아이콘 원본
```

## 빠른 시작

```bash
npm ci && npm run dev          # 프런트(5173)
cd server && npm ci && npm start  # API 프록시(3001) — dev 전에 켜 둔다
```

세부 요구사항(Node 버전·환경변수·테스트·DB)은 [SETUP.md](SETUP.md)가 단일 출처다.

## 스택

Vite + React + TypeScript · Tailwind v4 + shadcn/ui(Radix) · React Router · TanStack Query · Vitest (프런트) · Express + PostgreSQL (서버)

## 문서

| 궁금한 것               | 문서                                                                |
| ----------------------- | ------------------------------------------------------------------- |
| 설치·실행               | [SETUP.md](SETUP.md)                                                |
| 전체 문서 목차          | [docs/README.md](docs/README.md)                                    |
| 진행 상태·결정 필요     | [docs/STATUS.md](docs/STATUS.md)                                    |
| 작업 규칙·이름 규칙     | [CLAUDE.md](CLAUDE.md) · [docs/conventions.md](docs/conventions.md) |
| 계산 공식(Time-Safe 등) | [docs/formulas/](docs/formulas/)                                    |
| 디자인 토큰·화면 명세   | [docs/design/](docs/design/)                                        |
| 레거시 프로토타입 안내  | [docs/legacy-readme.md](docs/legacy-readme.md)                      |
