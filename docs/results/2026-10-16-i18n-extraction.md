# 레거시 문구 i18n JSON 추출

> 상태: 확정 · 2026-10-16

## 목표
3단계 전에 레거시 문구를 react-i18next용 언어별 JSON으로 옮긴다(의미 기반 키, ko→en 폴백, 키 타입 검사).

## 방법
- [`scripts/extract-legacy-i18n.mjs`](../../scripts/extract-legacy-i18n.mjs)가 `app/index.html`의 `STR`·`CAT_LABELS`를 그대로 읽어 `src/i18n/locales/<lang>.json`과 [대응표](../design/i18n-keys.md)를 만든다.
- 레거시 키 → 의미 기반 키는 스크립트의 `KEY_MAP`(화면·영역 단위 네임스페이스: `nav`, `onboarding`, `flight`, `timeSafe`, `home`, `booking`, `confirm`, `luggage`, `my`, `course`, `savedCourse`, `dayuse`, `unit`, `common`, `category`, `brand`).
- 자리표시자 `{x}` → `{{x}}`.
- 검증: [`locales.test.ts`](../../src/i18n/locales.test.ts) — 언어별 키 집합·자리표시자 일치, 레거시 원문과 전 문구 대조, 빈 문자열 비폴백. 없는 키는 `tsc` 오류(`i18next.d.ts`, 원본 = ko.json).

## 수치
| 항목 | 값 |
|---|---|
| 추출 문구 | **190** (STR 183 + CAT_LABELS 7) |
| 언어 | 5 (ko, en, zh, ja, vi) — 누락 0 |
| 의도된 빈 문자열 | 3 (`home.timeFit.build.suffix`의 en·zh·vi — 문장 끝 조각) |
| 레거시 원문 대조 | 183 키 × 5 언어 전부 일치 |
| 수정 필요 표시 | 5 키 (A7 문구 4개, 일정 요약 1개) — 대응표 "비고" |

## 결론
- 문구는 레거시와 한 글자도 다르지 않게 옮겼다. 고칠 문구(A7·요약)는 표시만 했다.
- 데이터 이름(숙소·장소명·지역명)은 UI 문구가 아니라 데이터라 4단계에서 데이터 파일로 옮긴다.
- 복수형(예: "{{n}} bookings")은 레거시처럼 처리하지 않았다. 필요하면 i18next plural 키로 바꾼다.

## 이후 추가한 키
| 키 | 추가 단계 | 번역 |
|---|---|---|
| `common.back` | 3단계(뒤로 버튼 aria-label) | ko/en 확인, zh·ja·vi 미검수 |
| `timeSafe.bufferBreakdown` | 4단계 Time-Safe | ko/en 확인, zh·ja·vi 미검수 |
| `timeSafe.warning.over24h`, `timeSafe.warning.departBeforeArrival` | 4단계 Time-Safe | ko/en 확인, zh·ja·vi 미검수 |

## 다음 할 일
- [ ] 3단계 컴포넌트·탭바부터 `t()` 사용
- [ ] A7·요약 문구 결정 시 5개 언어 JSON을 함께 수정(이후 추출 스크립트는 다시 돌리지 않는다)
