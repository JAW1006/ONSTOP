# TimeStay 문서 목차

> 상태: 확정 · 최종 수정 2026-10-16

| 영역 | 문서 | 상태 | 내용 |
|---|---|---|---|
| 진행 | [STATUS.md](STATUS.md) | 확정 | 단계 진행, 결정됨 / **결정 필요** 목록 |
| 용어 | [GLOSSARY.md](GLOSSARY.md) | 초안 | 외출 가능 시간·코스 가용 시간·버퍼 등 용어 정의 |
| 제품 | [product/overview.md](product/overview.md) | 초안 | 서비스 개요·핵심 기능·수익 모델 |
| 제품 | [product/market.md](product/market.md) | 초안 | 시장 규모·타깃 (수치 미검증) |
| 디자인 | [design/design-tokens.md](design/design-tokens.md) | 초안 | 색·반경·그림자·타이포·레이아웃 토큰 |
| 디자인 | [design/components.md](design/components.md) | 초안 | 공통 UI 컴포넌트 목록 |
| 디자인 | [design/data.md](design/data.md) | 초안 | 숙소·장소 데이터 출처·검증 상태 |
| 디자인 | [design/i18n-keys.md](design/i18n-keys.md) | 확정 | 레거시 문구 키 → 새 i18n 키 대응표(자동 생성) |
| 디자인 | [design/i18n-review.md](design/i18n-review.md) | 초안 | 추가 문구 번역 검수 요청 표(ko 원문 + 4개 언어, 자동 생성) |
| 디자인 | [design/screens/](design/screens/README.md) | 초안 | 화면별 명세 |
| 공식 | [formulas/time-safe.md](formulas/time-safe.md) | 초안 | 실제 외출 가능 시간 |
| 공식 | [formulas/time-fit.md](formulas/time-fit.md) | 초안 | 코스 시간 예산·자동 추천 |
| 공식 | [formulas/dayuse-pricing.md](formulas/dayuse-pricing.md) | 초안 | 데이유즈 타임블록 가격·수수료 |
| 공식 | [formulas/som.md](formulas/som.md) | 초안 | TAM/SAM/SOM |
| 결정 | [decisions/ADR-0001-react-migration.md](decisions/ADR-0001-react-migration.md) | 확정 | React 마이그레이션 |
| API | [api/](api/README.md) | 초안 | 외부 API 실제 응답 샘플·필드 형식 |
| 결과 | [results/](results/) | — | 날짜-주제.md 실험·검증 기록 |
| 이력 | [changelog.md](changelog.md) | — | 한 줄 변경 기록 |

## 규칙 요약
- 공식의 단일 출처 = `formulas/*.md` → `src/domain` 코드·테스트가 예시값을 그대로 따름.
- 상수는 `src/domain/constants.ts` 한 곳, md에서도 같은 이름(`DEPARTURE_SECURITY_MIN` 등)으로 참조.
- 숫자에는 출처·기준 연도, 검증 안 된 값은 **미검증**.
- 상단에 `상태: 초안 | 확정 | 폐기`.
