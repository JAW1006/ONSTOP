# 환경변수

> 상태: 확정 · 최종 수정 2026-10-16 · 확인 방법: `server/` 코드의 `process.env` 전수 검색(node_modules 제외)
> 템플릿: [`server/.env.example`](../../server/.env.example) · 배포 선언: [`render.yaml`](../../render.yaml)

## 서버(`server/server.js`)가 읽는 변수
`dotenv/config`로 **실행 위치의 `.env`**를 읽는다(`cd server && npm start` → `server/.env`).

| 변수 | 필수 | 용도 | 사용 엔드포인트 | 발급처 | 없을 때 | render.yaml |
|---|---|---|---|---|---|---|
| `AIRPORT_SERVICE_KEY` | **필수** | 인천국제공항공사 API 인증키(여객편 운항현황·출국장 혼잡도 T1·**T2** — API마다 활용신청) | `/api/flight/arrival`, `/api/flight/departure`, `/api/security-wait`, `/api/security-wait/t2` | [공공데이터포털](https://www.data.go.kr) 활용신청 → 일반 인증키(Encoding/Decoding 둘 다 가능) | 서버는 뜨고 경고만. 해당 엔드포인트 500 → 데모 도착 10:30, 수속 고정 50분 | 선언됨 |
| `KAKAO_REST_API_KEY` | **필수** | 카카오 REST API 키(비밀) | `/api/route`, `/api/places`, `/api/places/search` | [Kakao Developers](https://developers.kakao.com) → 앱 키 → REST API 키. 제품 "카카오모빌리티"·"카카오맵" 활성화 필요 | 해당 엔드포인트 500 → 더미 이동시간, 주변 가게 없음 | 선언됨 |
| `ODSAY_API_KEY` | 선택 | 대중교통 경로 | `/api/transit` | [ODsay Lab](https://lab.odsay.com) → API 신청 | 500 → 앱이 자동차 이동시간으로 대체 | 선언됨 |
| `PORT` | 선택 | 서버 포트(기본 `3001`) | 전체 + `app/` 정적 서빙 | — | 3001 | 미선언(Render가 자동 주입) |

2026-10-16 점검: 카카오 앱이 둘이다. **레거시 지도와 같은 앱**(JavaScript 키 `7bcb39…`)의 REST 키는 길찾기·로컬 검색 모두 정상 → `server/.env`에 사용. **"모빌리티" 앱** REST 키(2개)는 길찾기만 되고 로컬 검색은 "카카오맵" 제품이 꺼져 있어 403 → 사용 안 함. ODsay는 **서버용 키 + 허용 IP 등록**이 필요하다(미등록이면 `ApiKeyAuthFailed`) — 개발 PC IP 등록 후 정상, 배포 서버 IP는 별도 등록.

코드 위치: `server.js` 17줄(`AIRPORT_SERVICE_KEY`), 187줄(`KAKAO_REST_API_KEY`), 320줄(`ODSAY_API_KEY`), 365줄(`PORT`).

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
