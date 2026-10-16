# TimeStay 문서 목차

> 상태: 확정 · 최종 수정 2026-10-16

| 영역 | 문서 | 상태 | 내용 |
|---|---|---|---|
| 진행 | [STATUS.md](STATUS.md) | 확정 | 단계 진행, 결정됨 / **결정 필요** 목록 |
| 용어 | [GLOSSARY.md](GLOSSARY.md) | 초안 | 외출 가능 시간·코스 가용 시간·버퍼 등 용어 정의 |
| 제품 | [product/overview.md](product/overview.md) | 초안 | 서비스 개요·핵심 기능·수익 모델 |
| 제품 | [product/market.md](product/market.md) | 초안 | 시장 규모·타깃 (수치 미검증) |
| 제품 | [product/roadmap.md](product/roadmap.md) | 초안 | 서비스 운영 로드맵(기반 / 서비스 핵심 / 신뢰·품질), 남은 화면 순서, 서버 TS·모노레포 계획 |
| 제품 | [product/hotel-interview.md](product/hotel-interview.md) | 초안 | 호텔 인터뷰 질문(데이유즈 블록·가격, 예약 확인, 정산, 노쇼, 사진 허락) |
| 디자인 | [design/design-tokens.md](design/design-tokens.md) | 초안 | 색·반경·그림자·타이포·레이아웃 토큰 |
| 디자인 | [design/components.md](design/components.md) | 초안 | 공통 UI 컴포넌트 목록 |
| 디자인 | [design/data.md](design/data.md) | 초안 | 숙소·장소 데이터 출처·검증 상태 |
| 디자인 | [design/data-verification.md](design/data-verification.md) | 초안 | 숙소·장소 미검증 값 116개(항목·현재 값·확인 방법, 자동 생성) |
| 디자인 | [design/i18n-keys.md](design/i18n-keys.md) | 확정 | 레거시 문구 키 → 새 i18n 키 대응표(자동 생성) |
| 디자인 | [design/i18n-review.md](design/i18n-review.md) | 초안 | 추가·변경 문구 원어민 검수 표(자동 생성) |
| 디자인 | [design/i18n-review-legacy.md](design/i18n-review-legacy.md) | 초안 | 레거시에서 옮긴 문구 원어민 검수 표(자동 생성) |
| 디자인 | [design/screens/](design/screens/README.md) | 초안 | 화면별 명세 |
| 공식 | [formulas/time-safe.md](formulas/time-safe.md) | 초안 | 실제 외출 가능 시간 |
| 공식 | [formulas/time-fit.md](formulas/time-fit.md) | 초안 | 코스 시간 예산·자동 추천 |
| 공식 | [formulas/dayuse-pricing.md](formulas/dayuse-pricing.md) | 초안 | 데이유즈 상품 구조(A9: 호텔별 판매 블록·가격표)·수수료 |
| 공식 | [formulas/som.md](formulas/som.md) | 초안 | TAM/SAM/SOM |
| 결정 | [decisions/ADR-0001-react-migration.md](decisions/ADR-0001-react-migration.md) | 확정 | React 마이그레이션 |
| 결정 | [decisions/ADR-0002-database.md](decisions/ADR-0002-database.md) | 초안 | DB 선택 |
| 결정 | [decisions/ADR-0003-auth.md](decisions/ADR-0003-auth.md) | 초안 | 인증(회원/비회원) |
| 결정 | [decisions/ADR-0004-payment.md](decisions/ADR-0004-payment.md) | 초안(제안) | 결제·정산 구조 A/B 비교, 법적 확인 항목 |
| 결정 | [decisions/ADR-0005-environments-deploy.md](decisions/ADR-0005-environments-deploy.md) | 초안 | 환경 분리·배포 흐름·Render 변경 계획 |
| 결정 | [decisions/ADR-0006-return-alert.md](decisions/ADR-0006-return-alert.md) | 초안(제안) | 복귀 알림(카운트다운·캘린더 → 앱 기기 알림, 웹 푸시 보조, iOS 제약 원문) |
| 운영 | [operations/external-apis.md](operations/external-apis.md) | 초안 | 외부 API 쿼터·상업적 이용 조건(출처·미확인 표시) |
| 운영 | [operations/monitoring.md](operations/monitoring.md) | 초안 | 모니터링·에러 추적 |
| 법률 | [legal-checklist.md](legal-checklist.md) | 초안 | 법률·약관·개인정보·면책 확인 항목(법률 자문 아님) |
| API | [api/](api/README.md) | 초안 | 외부 API 실제 응답 샘플·필드 형식 |
| 결과 | [results/](results/) | — | 날짜-주제.md 실험·검증 기록 |
| 이력 | [changelog.md](changelog.md) | — | 한 줄 변경 기록 |

## 규칙 요약
- 공식의 단일 출처 = `formulas/*.md` → `src/domain` 코드·테스트가 예시값을 그대로 따름.
- 상수는 `src/domain/constants.ts` 한 곳, md에서도 같은 이름(`DEPARTURE_SECURITY_MIN` 등)으로 참조.
- 숫자에는 출처·기준 연도, 검증 안 된 값은 **미검증**.
- 상단에 `상태: 초안 | 확정 | 폐기`.
