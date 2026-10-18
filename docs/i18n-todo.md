# 번역 검수 필요 (디자인 이식 1단계)

> 상태: 초안 · 최종 수정 2026-10-18

디자인 이식 1단계에서 새로 추가한 i18n 키 중 ja/zh/vi는 기계적으로 옮긴 값이라 원어민 검수가 안 됐다. ko/en은 기존 문구(GLOSSARY·공식 용어)를 그대로 썼으므로 제외.

실제 상태는 `src/i18n/added-keys.json`(`reviewed: false`)과 `docs/design/i18n-review.md`(자동 생성, `node scripts/i18n-review-table.mjs`)가 단일 출처다. 이 표는 그 목록 중 1단계에서 새로 생긴 키만 추려 보여준다.

| 키                          | ja           | zh         | vi                  | 비고                                   |
| --------------------------- | ------------ | ---------- | ------------------- | -------------------------------------- |
| `timeBar.legend.prep`       | 準備         | 准备       | Chuẩn bị            | GLOSSARY "준비" 직역                   |
| `timeBar.legend.travel`     | 移動         | 移动       | Di chuyển           | GLOSSARY "이동" 직역                   |
| `timeBar.legend.stay`       | 滞在         | 停留       | Lưu trú             | GLOSSARY "체류" 직역                   |
| `timeBar.legend.margin`     | 余裕         | 余量       | Dự phòng            | GLOSSARY "여유" 직역                   |
| `timeBar.source.baseline`   | 安全基準     | 安全基准   | Mốc an toàn         | "안전 기준" 뱃지(실시간 아닌 값)       |
| `timeBar.ariaLabel`         | 기계적 조합 | 기계적 조합 | 기계적 조합        | 스크린리더용 — 문장 자연스러움 확인 필요 |
| `transitTimeBar.ariaLabel`  | 기계적 조합 | 기계적 조합 | 기계적 조합        | 위와 동일                              |
| `transitTimeBar.nestedCourse` | 外出可能時間内のコース | 外出可用时间内的路线 | Lộ trình trong khoảng thời gian ra ngoài | 직역, 길이 확인 필요(2열 범례에서 줄바꿈 가능) |

ko/en은 ja/zh/vi와 달리 원문 작성(GLOSSARY·기존 `common.badge.live` 등 재사용)이라 이 표에서 제외했다. `nav.*`(탭바 라벨)는 기존에 이미 5개 언어 검수가 끝난 키를 재사용했으므로 새로 추가하지 않았다.
