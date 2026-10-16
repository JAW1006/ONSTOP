# ADR-0005: 환경 분리(dev / staging / prod)와 배포 흐름

> 상태: **초안(제안 — 결정 전)** · 2026-10-16 · Render 요금·기능 세부는 **미확인**(Render 문서·대시보드로 확인 필요)

## 배경 — 지금 배포
`render.yaml`(2026-10-16 기준):
| 항목 | 값 |
|---|---|
| 서비스 | 웹 서비스 1개, 이름 `dropshopping`(옛 프로젝트 이름) |
| 플랜 | `free` |
| 위치 | `rootDir: server`, `npm install` → `npm start`(`node server.js`) |
| 프런트 | 서버가 `app/`(레거시 단일 HTML)을 정적 서빙 — **React 앱은 배포되지 않는다** |
| 환경변수 | `AIRPORT_SERVICE_KEY`, `KAKAO_REST_API_KEY`, `ODSAY_API_KEY`(sync: false, 대시보드 입력) |
| 브랜치 | `main` 푸시 시 자동 배포(사용자 확인 — 그래서 `migration/react-ts`는 main에 안 올림) |

문제: 환경이 하나뿐이라 시험과 운영이 같다. React 앱 배포 경로가 없다. 무료 플랜의 유휴 시 정지 여부·외부로 나가는 IP(ODsay 허용 IP 등록에 필요)는 **미확인**.

## 결정 (제안)
| 환경 | 프런트 | API | DB | 브랜치 | 키 |
|---|---|---|---|---|---|
| **dev** | 로컬 `npm run dev`(5173) | 로컬 `server`(3001) | 로컬 또는 dev DB | 작업 브랜치 | 개발계정 키(`server/.env`, `.env.local`) |
| **staging** | Render 정적 사이트 | Render 웹 서비스 | staging DB | `staging` 브랜치 자동 배포 | 운영과 **다른** 키(가능한 API는 개발계정) |
| **prod** | Render 정적 사이트(또는 CDN) | Render 웹 서비스(유료 플랜) | prod DB | `main` — **수동 승인 후 배포** | 운영계정 키 |

| 원칙 | 내용 |
|---|---|
| 프런트·API 분리 | Vite 빌드 결과는 정적 사이트로, API는 별도 서비스. 프런트는 `VITE_API_BASE`로 API 주소를 받는다(지금은 같은 출처 `/api` 가정) |
| 비밀 | 서버 키는 Render 환경변수(환경별 분리). 프런트 변수(`VITE_*`)는 공개되므로 비밀을 넣지 않는다(카카오 JS 키는 공개용) |
| 카카오맵 도메인 | 환경마다 JS SDK 도메인 등록(5173, staging 주소, prod 주소) |
| ODsay | 서버용 키는 **호출하는 서버 IP 등록 필요** → staging·prod 서비스의 외부 IP 확인 후 등록(Render 고정 IP 제공 여부 **미확인**) |
| 배포 전 검사 | 테스트(Vitest) + 타입 검사 + 빌드 통과를 PR 조건으로(CI 도입) |

## Render 설정 변경 계획 (순서)
| 순서 | 변경 | 되돌리기 |
|---|---|---|
| 1 | staging 서비스 2개 추가(정적 사이트 `timestay-web-staging`, 웹 서비스 `timestay-api-staging`) — 기존 `dropshopping`은 그대로 | 추가 서비스 삭제 |
| 2 | API 서버: `app/` 정적 서빙 제거 대신 CORS에 프런트 도메인 허용(5단계 레거시 이동과 함께) | 이전 커밋 배포 |
| 3 | staging에서 전체 흐름 확인(온보딩→홈→코스→예약), 카카오 도메인·ODsay IP 등록 | — |
| 4 | prod 서비스 2개 생성(유료 플랜 검토), 도메인 연결 | — |
| 5 | `main` 자동 배포를 prod로 전환, 수동 승인 단계 추가. 기존 `dropshopping`은 레거시 보관용으로 이름 변경 또는 종료 | 기존 서비스 재활성 |
| 6 | `render.yaml`을 환경별 서비스 정의로 갱신(Blueprint) | 이전 `render.yaml` |

## 대안
| 대안 | 이유 |
|---|---|
| 지금처럼 서버가 프런트까지 서빙 | 단순하지만 프런트 배포가 서버 재시작에 묶이고 CDN 캐시를 못 씀 |
| Vercel·Netlify(프런트) + Render(API) | 프런트 미리보기 배포가 편함. 서비스가 두 곳으로 나뉘어 관리 부담 |
| 컨테이너(Cloud Run 등) | 유연하지만 지금 규모에 과함 |

## 결과(예상)
- (+) 운영 전에 staging에서 확인할 수 있다. 키·DB가 환경별로 분리된다.
- (−) 서비스 수·비용 증가(무료 플랜 범위 **미확인**).
- 결정 전 확인: Render 플랜별 유휴 정지·외부 IP·요금, 사용할 도메인.
