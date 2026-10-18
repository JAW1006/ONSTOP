# TimeStay — 에이전트 작업 규칙

인천공항 환승 외국인을 위한 데이유즈 + AI 큐레이션 앱. 레거시 단일 HTML(`app/index.html`)을 React로 이식 중.
**설치·실행은 [SETUP.md](SETUP.md)를 그대로 따른다** — 명령을 직접 추측하지 않는다.

스택·폴더 책임·공식·문서 템플릿 등 **나머지 규칙은 [CLAUDE.md](CLAUDE.md)에 있다.** 이 파일은 그보다 먼저 지킬 것만 담는다.

## 0. 작업 시작 전에 반드시 확인한다

**순서대로, 코드를 고치기 전에.**

| #   | 확인                                           | 어떻게                                                                                                                                                  |
| --- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **현재 브랜치**                                | `git status -sb`. 작업 브랜치는 `migration/react-ts`다. `main`은 Render 자동 배포라 **올리지 않는다**                                                   |
| 2   | 원격과 갈라졌는지                              | `git fetch` 후 `git status`. 로컬 `main`이 force-push로 다시 쓰여진 적이 있다                                                                           |
| 3   | **[docs/STATUS.md](docs/STATUS.md)**           | "결정됨"·"결정 필요"·"운영 배포 금지"를 읽는다. 이미 정해진 것을 다시 정하지 않는다                                                                     |
| 4   | 그 기능의 명세                                 | `docs/design/screens/<화면>.md`, `docs/formulas/*.md`, `docs/api/*.md`, `docs/decisions/ADR-*.md`                                                       |
| 5   | **이미 있는 구현**                             | 같은 기능이 다른 브랜치나 `src/`에 이미 있는지. 있으면 **그걸 따르거나 고친다 — 새로 만들지 않는다**                                                    |
| 6   | **[docs/conventions.md](docs/conventions.md)** | 코드를 쓰기 전에. 폴더·파일·함수·상수·DB/API 필드·오류 응답·커밋·브랜치 이름 규칙의 단일 출처다. 거기 없는 패턴은 그 폴더에서 이미 쓰이는 방식을 따른다 |

### 왜

이 저장소는 레거시(`app/index.html`)와 React 이식본(`src/`)이 함께 있고, 브랜치마다 진행도가 다르다. 확인을 건너뛰면 **이미 구현된 기능을 다른 방식으로 또 만들게 되고**, 합칠 때 충돌한다. 2026-10-18에 실제로 그랬다 — 레거시 쪽에서 만든 예약 요청 폼과 T2 혼잡도가 이 브랜치에 이미 있어서 버렸다([STATUS](docs/STATUS.md) 2026-10-18 항목).

### 어긋나면

명세와 코드가 다르거나, 명세가 모호하거나, 이미 있는 구현이 명세와 어긋나면 **임의로 고르지 말고 사용자에게 먼저 묻는다**(CLAUDE.md 규칙 7과 같다).

## 1. 명세가 코드보다 먼저다

- 새 화면: `docs/design/screens/<화면>.md`를 먼저 쓴다.
- 새 API: `docs/api/<이름>.md`를 먼저 쓴다.
- 공식 변경: `docs/formulas/*.md`를 먼저 고치고, 같은 변경에서 `src/domain` 코드와 테스트를 함께 고친다.
- 끝나면 `docs/changelog.md`에 한 줄, 의미 있는 결정은 `docs/STATUS.md`에 남긴다.

## 2. 바꾼 코드는 검사하고 올린다

| 무엇                | 명령                                                                                                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 프런트              | `npm ci && npm test && npm run build`                                                                                                                                                                |
| 서버(예약 요청 API) | `cd server && npm test` — docker로 **일회용 Postgres**를 띄워 진짜 DB에 붙는다. Docker가 없으면 `npm run test:nodb`(통합 테스트는 건너뜀)                                                            |
| 포맷                | `npx prettier --check .`(저장소 루트에서). 커밋 전에 `npx prettier --write .`로 고친다. 설정은 `.prettierrc.json`, 손대지 않는 파일은 `.prettierignore`(자동 생성 문서, `app/index.html`, lock 파일) |
| 린트                | `npm run lint`(oxlint — 미사용 변수, `src/domain` import 경계만. 네이밍은 안 봄. 왜 oxlint인지는 [conventions.md](docs/conventions.md) 12장)                                                         |

- CI(`.github/workflows/ci.yml`)가 푸시마다 같은 것 + 비밀값 검사를 돌린다.
- **`server/.env`의 `DATABASE_URL`로 테스트·마이그레이션을 돌리지 않는다.** 실제 DB다. 테스트는 `TEST_DATABASE_URL`만 쓰고, 그 값이 `DATABASE_URL`과 같거나 원격이면 스스로 중단한다.

## 3. 운영 배포 금지를 풀지 않는다

예약 요청이 **실제로 호텔에 전달되고 회신을 받기 전까지** prod 배포 금지다([ADR-0005](docs/decisions/ADR-0005-environments-deploy.md), [STATUS](docs/STATUS.md)).
프런트의 데모 게이트(`VITE_DEMO_MODE`)와 서버 관리자 인증의 fail-closed 동작을 **느슨하게 만들지 않는다.**

## 4. 개인정보

- 수집은 이름·이메일만([booking](docs/design/screens/booking.md) B4). 전화·여권·국적을 받지 않는다.
- **로그·오류 메시지에 이메일·이름을 쓰지 않는다**([api/booking-requests](docs/api/booking-requests.md) "개인정보").
- 보관 기간·파기는 아직 정해지지 않았다([legal-checklist](docs/legal-checklist.md) 2-1). 자동 삭제 작업을 만들지 않는다.

## 5. 검증 안 된 값은 "미검증"으로 둔다

숫자에는 출처와 기준 연도를 붙인다. 근거 없이 그럴듯한 값을 채우지 않는다.
