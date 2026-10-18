# 환경변수

> 상태: 확정 · 최종 수정 2026-10-18 · 확인 방법: `server/` 코드의 `process.env` 전수 검색(node_modules 제외)
> 템플릿: [`server/.env.example`](../../server/.env.example) · 배포 선언: [`render.yaml`](../../render.yaml)

## 서버(`server/server.js`, `server/booking.js`)가 읽는 변수
`dotenv/config`로 **실행 위치의 `.env`**를 읽는다(`cd server && npm start` → `server/.env`).

| 변수 | 필수 | 용도 | 사용 엔드포인트 | 발급처 | 없을 때 | render.yaml |
|---|---|---|---|---|---|---|
| `AIRPORT_SERVICE_KEY` | **필수** | 인천국제공항공사 API 인증키(여객편 운항현황·출국장 혼잡도 T1·**T2** — API마다 활용신청) | `/api/flight/arrival`, `/api/flight/departure`, `/api/security-wait`, `/api/security-wait/t2` | [공공데이터포털](https://www.data.go.kr) 활용신청 → 일반 인증키(Encoding/Decoding 둘 다 가능) | 서버는 뜨고 경고만. 해당 엔드포인트 500 → 데모 도착 10:30, 수속 고정 50분 | 선언됨 |
| `KAKAO_REST_API_KEY` | **필수** | 카카오 REST API 키(비밀) | `/api/route`, `/api/places`, `/api/places/search` | [Kakao Developers](https://developers.kakao.com) → 앱 키 → REST API 키. 제품 "카카오모빌리티"·"카카오맵" 활성화 필요 | 해당 엔드포인트 500 → 더미 이동시간, 주변 가게 없음 | 선언됨 |
| `ODSAY_API_KEY` | 선택 | 대중교통 경로 | `/api/transit` | [ODsay Lab](https://lab.odsay.com) → API 신청 | 500 → 앱이 자동차 이동시간으로 대체 | 선언됨 |
| `PORT` | 선택 | 서버 포트(기본 `3001`) | 전체 + `app/` 정적 서빙 | — | 3001 | 미선언(Render가 자동 주입) |
| `DATABASE_URL` | 예약 요청 쓸 때 **필수** | 예약 요청 저장용 PostgreSQL 접속 문자열. 서버 시작 시 `server/migrations/*.sql` 자동 적용 | `/api/booking-requests` 전체 | 관리형 PostgreSQL — 공급자 **결정 전**([ADR-0002](../decisions/ADR-0002-database.md)) | 서버는 뜨고 경고만. 해당 엔드포인트 `500 database_not_configured` | 선언됨 |
| `ADMIN_USER` | `/admin` 쓸 때 **필수** | 관리 화면·관리자 API의 HTTP Basic 사용자명 | `GET /api/booking-requests`, `PATCH /api/booking-requests/:id`, `/admin` | 직접 정함(긴 임의 문자열) | **실제 핸들러를 등록하지 않고 `503 admin_disabled`**(fail-closed) | 선언됨 |
| `ADMIN_PASSWORD` | `/admin` 쓸 때 **필수** | 위와 같은 Basic 비밀번호. 비교는 `crypto.timingSafeEqual` | 위와 같음 | 직접 정함 | 위와 같음 | 선언됨 |

`DATABASE_URL`·`ADMIN_*`는 `server/booking.js`가 읽는다. 호스트가 `localhost`/`127.0.0.1`이면 SSL 없이, 그 밖이면 SSL로 붙되 체인 검증은 끈다(관리형 Postgres의 자체 서명 체인 — 공급자 확정 후 CA 번들로 교체 예정). 환경별로 **다른 DB·다른 자격증명**을 쓴다([ADR-0005](../decisions/ADR-0005-environments-deploy.md)).

⚠ 관리 화면에는 이용자의 **이름·이메일**이 보인다. 자격증명을 공유하지 않고, 보관 기간·파기는 [legal 2-1](../legal-checklist.md) 확인 후 정한다.

2026-10-16 점검: 카카오 앱이 둘이다. **레거시 지도와 같은 앱**(JavaScript 키 `7bcb39…`)의 REST 키는 길찾기·로컬 검색 모두 정상 → `server/.env`에 사용. **"모빌리티" 앱** REST 키(2개)는 길찾기만 되고 로컬 검색은 "카카오맵" 제품이 꺼져 있어 403 → 사용 안 함. ODsay는 **서버용 키 + 허용 IP 등록**이 필요하다(미등록이면 `ApiKeyAuthFailed`) — 개발 PC IP 등록 후 정상, 배포 서버 IP는 별도 등록.

코드 위치(2026-10-18): `server.js` 22줄(`AIRPORT_SERVICE_KEY`), 232줄(`KAKAO_REST_API_KEY`), 365줄(`ODSAY_API_KEY`), 417줄(`PORT`) · `booking.js` 206–208줄(`DATABASE_URL`, `ADMIN_USER`, `ADMIN_PASSWORD`).

## 환경변수가 아닌 키
| 키 | 위치 | 성격 |
|---|---|---|
| 카카오맵 JavaScript 키 `7bcb39…ab06` | `app/index.html` 22줄(SDK `appkey`) | **공개용**. 카카오 정책상 프런트엔드에 노출되며 Kakao Developers의 "플랫폼 > Web 도메인" 등록으로만 보호된다. REST 키와 다르다. React 이식(4단계)에서 `VITE_` 변수로 옮길지는 미정 |

## 무시 규칙(.gitignore)
| 경로 | 무시됨 | 규칙 |
|---|---|---|
| `server/.env` | 예 | `server/.gitignore`의 `.env` |
| `server/.env.example` | 아니오(의도대로 커밋) | — |
| 레포 루트 `.env` | **아니오** | 루트 `.gitignore`에 `.env` 규칙 없음 |
| `server/.env.local` 등 `.env.*` | **아니오** | `.env`만 정확히 일치 |

## git 이력 점검 (2026-10-16, 모든 브랜치 22커밋)
| 점검 | 결과 |
|---|---|
| `.env` 파일이 커밋된 적 | **없음** — 커밋된 `.env*`는 `server/.env.example`뿐(03d2e8d, 04dc8e8) |
| 서버 변수에 실제 값이 들어간 적 | **없음** — README의 자리표시자(`발급받은_REST_API_키` 등)뿐 |
| `KakaoAK …`, `serviceKey=…`, `apiKey=…` 리터럴 | 없음 |
| 32자 이상 16진수·base64 토큰(lock 파일 제외) | 카카오맵 **JavaScript 키** 2개만: `7bcb39…ab06`(현재), `b35a8e…54a3`(648d439에서 잠시 사용 후 a18d5ca에서 되돌림). 둘 다 공개용 키 |
| `package-lock.json`의 base64 | npm 무결성 해시(`sha512-…`) — 키 아님 |

한계: 패턴 검색이라 형식이 다른 키(짧은 키, 다른 인코딩)는 놓칠 수 있다. 커밋 전 비밀 검사 도구(gitleaks 등) 도입은 미정.
