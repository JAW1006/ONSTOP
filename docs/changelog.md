# Changelog

> 의미 있는 변경만 한 줄씩. 최신이 위.

| 날짜 | 영역 | 변경 |
|---|---|---|
| 2026-10-16 | i18n | react-i18next 도입, 레거시 문구 190개 × 5개 언어 JSON 추출(의미 기반 키, 원문 대조 테스트, 키 타입 검사) |
| 2026-10-16 | Time-Safe | 버퍼 3요소 구조 확정, 기본값 50/50/30(① 0→50, 미검증) — #1 예시 3h01m → 2h11m. 입국 대기 데이터 조사, docs/api 추가 |
| 2026-10-16 | Time-Safe·Time-Fit | A1·A5: 버퍼 3분할(입국심사 0 임시 / 보안검색·출국심사 50 / 게이트 여유 30), 외출 가능 시간·코스 가용 시간 분리, GLOSSARY.md 추가 |
| 2026-10-16 | Time-Safe | A3: T1 실시간 대기시간을 하한 방식 `max(SECURITY_BUFFER_MIN, 실시간)`으로 사용 |
| 2026-10-16 | Time-Safe | A2: 항공편 날짜·자정 넘김 처리(22:00→01:30 = 2h10m), 24h 초과·출발 선행 경고 |
| 2026-10-16 | domain | 2단계: Time-Safe·Time-Fit·이동시간·데이유즈 가격을 기존 동작 그대로 `src/domain`에 이식, 현재 결과 고정 테스트 36개 |
| 2026-10-16 | 세팅 | 1단계: Vite+React+TS 프로젝트, Tailwind v4·shadcn 설정, tokens.css, docs 뼈대, CLAUDE.md 추가 |
| 2026-10-16 | 문서 | 레거시 구조·계산 로직 분석 기록 ([results/2026-10-16-legacy-analysis.md](results/2026-10-16-legacy-analysis.md)) |
