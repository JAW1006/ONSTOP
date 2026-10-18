# 디자인 토큰 (TimeStay UI Kit, Figma Make 기준)

> 상태: 초안 · 최종 수정 2026-10-18
> 코드 참고: [`design/reference/`](../../design/reference/)(Figma Make 원본, 수정 금지) · 이식 대상: `src/styles/tokens.css`
> 이전 레거시 토큰 문서: [design-tokens-legacy.md](design-tokens-legacy.md)(반경·그림자·타이포·레이아웃은 아직 그쪽이 기준)

출처: Figma Make `TimeStay-UI-Kit-Design` (dsv9OZvZ5glG8BgiJVK1Hu) 의 index.css / App.tsx.
**이 문서가 색 토큰의 단일 기준이다.** 구현에서 임의로 값을 바꾸지 않는다.

## 1. 색 (한 색에는 한 의미만)

| 토큰         | 값      | 역할                                      | 사용 금지      |
| ------------ | ------- | ----------------------------------------- | -------------- |
| brand        | #2764e7 | 선택된 장소·선택 상태·주요 동작(버튼)     | 정상/성공 표시 |
| brand-dark   | #1647af | brand hover/pressed                       |                |
| brand-soft   | #eaf1ff | 선택된 카드/슬롯 배경                     | 체류 구간      |
| success      | #23845a | 정상 운항·확정·완료                       | 이동 표시      |
| success-soft | #e6f4ec | success 배경                              |                |
| travel       | #168b8a | 시간 바 이동 구간, 이동 경로, 이동 칩에만 | 정상/선택/장식 |
| prep         | #d4dae3 | 시간 바 준비 구간                         |                |
| stay         | #9cccec | 시간 바 체류 구간                         | 선택 카드 배경 |
| margin       | #efd99c | 시간 바 여유 구간                         |                |
| track        | #edf0f4 | 시간 바 트랙                              |                |
| gold         | #b88a35 | 호텔 베이스, 호텔 핀                      |                |
| gold-soft    | #f7efd9 | 호텔 관련 안내 배경                       |                |
| danger       | #d74a42 | 경고·시간 초과·공항 복귀·거절             |                |
| danger-soft  | #fff0ee | danger 배경                               |                |
| ink          | #142037 | 본문 글자, 진한 카드 배경                 |                |
| ink-soft     | #4b5870 | 보조 글자                                 |                |
| line         | #dce2eb | 구분선·테두리                             |                |
| pale         | #f0f3f7 | 보조 배경                                 |                |
| paper        | #ffffff | 화면 배경                                 |                |
| canvas       | #f6f8fb | 바깥 배경                                 |                |

### 글자용 어두운 색 (reference에는 없음, 이식 시 추가하는 의도된 차이)

배경·막대·아이콘 채움에는 위 색을 그대로 쓰고, **글자와 얇은 선 아이콘**에만 아래 값을 쓴다.

| 토큰        | 값      | 대체 대상                                         | 대비 |
| ----------- | ------- | ------------------------------------------------- | ---- |
| danger-ink  | #b3342c | danger 글자 (danger-soft 위 5.5, 흰색 위 6.1)     | 통과 |
| success-ink | #17694a | success 글자 (success-soft 위 5.87, 흰색 위 6.65) | 통과 |
| travel-ink  | #0f6f6e | travel 글자 (흰색 위 5.97)                        | 통과 |
| gold-ink    | #7a5a1c | gold 글자 (gold-soft 위 5.54)                     | 통과 |

- 위험 배경 위의 흰 글자(경고 버튼, 복귀 시각 경과 배너)는 danger가 아니라 danger-ink 배경을 쓴다.

### 대비 점검 (WCAG, 본문 4.5:1 / 큰 글자 3:1)

통과: ink-soft/white 7.17, brand/white 5.17, brand/brand-soft 4.56
미달(조정 필요):

- travel 글자 on white 4.12
- success on success-soft 4.10
- danger on danger-soft 3.83 (11px 안내문에 쓰이므로 글자는 더 어둡게)
- gold on white 3.12 (아이콘·큰 글자만 사용, 작은 글자 금지)
  시간 바 구간은 색만으로 구분하지 않고 라벨과 aria-label 값을 함께 쓴다.

## 2. 글자

- 한국어 Noto Sans KR / 중국어 Noto Sans SC / 일본어 Noto Sans JP / 영어·베트남어 Noto Sans, 숫자 강조 Space Grotesk
- 앱에 번들한다(원격 import 금지, 오프라인·개인정보 이유). :lang() 로 언어별 폰트 지정.
- 최소 크기: 본문 12px, 보조 라벨 11px. 터치 영역 최소 44x44px.

## 3. 시스템 영역

- 앱은 상태바·홈 인디케이터를 그리지 않는다. env(safe-area-inset-top/bottom)로 영역을 확보하고 헤더·탭바 배경만 이어 붙인다.
- 54px / 34px 은 대표 기기 예시값이며 코드에 하드코딩하지 않는다.
- 탭바 콘텐츠 높이 72px + safe-area-inset-bottom.
- 높이는 100dvh 기준.
- 화면별 상태바 글자색: 밝은 배경 화면 = 어두운 글자, 진한 배경 화면 = 밝은 글자, 바텀시트는 기존 유지, 중앙 모달은 딤과 함께 낮아짐.

## 4. 이동 수단 표기 (지도·범례)

- 대중교통: 굵은 실선 + 역 점 / 택시: 가는 실선 / 도보: 점선 / 공항 복귀: 빨간 점선
- 선과 칩 아이콘의 수단은 반드시 일치시킨다.

## 5. 시간 바 규칙

- 입력: 구간 배열 [{kind, minutes, label}] (kind = prep | travel | stay | margin | overrun)
- 폭은 분 비율로 계산한다. 고정 퍼센트 금지.
- 정의: 사용 = 준비 + 이동 + 체류, 가능 = 외출 가능 시간, 여유 = 가능 − 사용. 초과 시 overrun 구간.
- 화면에 "사용 / 가능"을 함께 표시하고 aria-label에 구간별 값과 총합을 넣는다.

## 5-1. 홈 Time-Safe 막대 범례 (reference의 결함을 고쳐서 이식)

- reference는 라벨을 구간 폭에 맞춰 4열로 놓아서 좁은 구간(탑승구 30분)의 글자가 한 자씩 줄바꿈되고 출처 뱃지가 찌그러진다. 그대로 옮기지 않는다.
- 막대 아래에 2열 범례로 놓는다: 견본(빗금=공항 절차, 외곽선=외출 가능) + 이름 + 분 + 출처 뱃지(실시간/안전 기준). 이름은 줄바꿈하지 않는다.
- "외출 가능 구간 안의 코스" 막대는 범례 아래 전체 폭에 둔다.
- 새 색은 추가하지 않는다. 계산 근거 시트(sheet)에도 같은 범례를 쓴다.

## 6. 구현 제외 항목

- 마이 → DESIGN QA(상태 보드, 색 역할표, 다국어 확장 테스트, 시스템 영역 규칙, 기기 프레임)는 서비스 화면이 아니다. 개발용 경로로만 둔다.
- 데모 값(₩48,000 데모 가격, 매출 예상, 샘플 이름·이메일)은 프로덕션 빌드에서 제외한다.
- PHASE 2 표시 기능(마이 프로필, 오프라인, 파트너 로그인·가격표·사진·취소 정책·매출)은 이번 구현 범위가 아니다.
