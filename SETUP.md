# 설치·실행 가이드

> 상태: 확정 · 최종 수정 2026-10-19
> 이 문서가 **설치·실행 절차의 단일 출처**다. 여기 없는 명령이 필요하면 이 문서의 결함이다 — 고치고 `docs/STATUS.md`에 남긴다.
> 작업 브랜치는 `migration/react-ts`다(`main`은 Render 자동 배포 — [AGENTS.md](AGENTS.md) 0장). 레거시 단일 파일 앱(`app/index.html`)의 안내는 [README.md](README.md)에 그대로 남아 있다 — 지금 실제로 돌리는 건 이 문서가 설명하는 Vite+React 쪽이다.

## 0. 요구사항

| 무엇    | 버전                                                           | 확인          |
| ------- | -------------------------------------------------------------- | ------------- |
| Node.js | `.nvmrc`에 고정(지금 22) — `nvm use`                           | `node -v`     |
| npm     | Node에 같이 따라오는 것 그대로                                 | `npm -v`      |
| Docker  | **서버 통합 테스트에만 필요.** 앱을 실행만 하는 데는 필요 없다 | `docker info` |

리포 전체가 **npm만** 쓴다(yarn·pnpm lockfile 없음). `npm install`을 다른 패키지 매니저로 하지 않는다 — lockfile이 깨진다.

## 1. 클론

```bash
git clone https://github.com/JAW1006/ONSTOP.git
cd ONSTOP
git checkout migration/react-ts   # main이 아니라 이 브랜치에서 작업한다
```

## 2. 프런트 (저장소 루트)

```bash
npm ci          # package-lock.json 그대로 설치(npm install 아님 — CI와 동일)
npm run lint    # oxlint — 미사용 변수, src/domain import 경계만
npm test        # Vitest, DB 없이 돈다
npm run build   # tsc -b(타입체크) + vite build
```

넷 다 **키·DB·Docker 없이** 그대로 통과해야 한다. 안 되면 이 문서나 그 명령이 참조하는 설정(`.oxlintrc.json`·`vite.config.ts`·`tsconfig*.json`)에 문제가 있다는 뜻이다.

포맷 검사(CI가 보는 것, 실제로 코드를 바꾸진 않음):

```bash
npx prettier --check .
```

어긋나면 `npx prettier --write .`로 고친다(`.prettierignore`에 뺀 파일은 그대로 둔다 — [conventions.md](docs/conventions.md) 11장).

## 3. 서버 (`server/`)

```bash
cd server
npm ci
cp .env.example .env
```

`.env`를 열어 값을 채운다 — 전체 표는 [docs/api/environment.md](docs/api/environment.md).

| 변수                          | 없으면                                                           |
| ----------------------------- | ---------------------------------------------------------------- |
| `AIRPORT_SERVICE_KEY`         | 항공편·혼잡도 엔드포인트 500, 앱은 데모 값으로 동작              |
| `KAKAO_REST_API_KEY`          | 길찾기·주변장소 500, 앱은 더미 이동시간으로 동작                 |
| `ODSAY_API_KEY`               | 선택. 없으면 대중교통 대신 자동차 값으로 대체                    |
| `DATABASE_URL`                | `/api/booking-requests`가 500. **서버 자체는 뜬다**              |
| `ADMIN_USER`/`ADMIN_PASSWORD` | `/admin`과 관리자 API가 503으로 닫힌다(fail-closed, 의도된 동작) |

**즉, 위 변수를 전부 빈칸으로 둬도 서버는 뜬다.** 해당 기능만 비활성화된다 — 처음 설치해서 화면이 뜨는지만 보려면 키 없이 시작해도 된다.

### 서버만 실행

```bash
npm start   # http://localhost:3001
```

### 서버 테스트

```bash
npm test
```

docker compose로 **일회용 PostgreSQL**(포트 5433, tmpfs — 끝나면 자동 삭제)을 띄우고 통합 테스트 + 오류 코드 일치 테스트를 돈다. **Docker가 없으면:**

```bash
npm run test:nodb   # DB가 필요한 테스트는 건너뛴다(그 사실을 출력)
```

자세한 내용: [docs/api/booking-requests.md](docs/api/booking-requests.md) "테스트".

## 4. 둘 다 띄워서 실제로 써보기

터미널 2개.

```bash
# 터미널 1
cd server && npm start        # :3001

# 터미널 2 (저장소 루트)
npm run dev                    # :5173, /api를 :3001로 프록시
```

브라우저로 **`http://localhost:5173`**을 연다(`127.0.0.1`은 안 됨 — Vite가 `localhost`만 수신하고, 카카오맵 도메인도 `http://localhost:5173`으로 등록돼 있다).

카카오맵을 실제로 보려면 저장소 루트에 `.env.local`을 만들고 `VITE_KAKAO_JS_KEY`를 채운다(`.env.example` 참고). 비어 있으면 지도 자리에 안내 문구만 뜨고 나머지는 동작한다.

## 5. 자주 막히는 지점

| 증상                                                       | 원인                                                               | 해결                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------- |
| `vite`가 다른 포트로 뜨거나 바로 종료                      | `5173`이 이미 쓰이고 있음(`strictPort: true`라 넘어가지 않고 실패) | 그 포트를 쓰는 프로세스를 종료                              |
| 코스 화면 지도가 안내 문구만 보임                          | `VITE_KAKAO_JS_KEY` 비어 있음 또는 도메인 미등록                   | 4번 참고. 기능 자체는 막히지 않는다                         |
| `/api/...`가 전부 404                                      | 서버(`:3001`)를 안 띄움                                            | 터미널 1 먼저                                               |
| `npm run build`가 타입 오류로 실패하는데 `npm test`는 통과 | `vitest`는 타입체크를 안 한다 — `tsc -b`가 따로 돈다               | build를 기준으로 본다                                       |
| `cd server && npm test`가 "건너뜀"만 찍고 끝남             | Docker 엔진이 꺼져 있음(설치는 돼 있어도)                          | `open -a Docker`(macOS) 후 재시도, 또는 `npm run test:nodb` |
| `npm ci`가 피어 의존성 에러                                | 없어야 한다 — 나면 버그, [docs/STATUS.md](docs/STATUS.md)에 보고   | —                                                           |

## 변경 이력

| 날짜       | 내용                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------ |
| 2026-10-19 | 최초 작성 — 빈 클론에서 실제로 따라가며 검증(절차: [docs/STATUS.md](docs/STATUS.md) "설치 검증") |
