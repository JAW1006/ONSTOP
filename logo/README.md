# DropShopping — 로고 에셋

여행 짐(캐리어)을 "떨어뜨리고(Drop)" 가볍게 다니는 서비스 컨셉의 브랜드 로고입니다.

## 파일 구성

| 파일 | 용도 |
|------|------|
| `app-icon.svg` | 앱 아이콘 (220×220, 라운드 스퀘어 배경) |
| `logo-horizontal.svg` | 가로형 락업 (아이콘 + 워드마크 + 태그라인) |
| `logo-monochrome.svg` | 단색(네이비) 버전 — 인쇄/단색 배경용 |
| `logo-reversed.svg` | 반전형 — 어두운 배경용 |
| `symbol-mark.svg` | 심볼 단독 (배경 없음) |
| `brand-sheet.svg` | 전체 브랜드 시트 (원본 시안) |

## 브랜드 컬러

| 컬러 | HEX | 쓰임 |
|------|-----|------|
| Teal Dark | `#0E8C84` | 캐리어 그라디언트(하단) |
| Teal | `#22C9B7` | 캐리어 그라디언트(상단) |
| Coral | `#FF6B5E` | 포인트(스트랩·"Drop") |
| Navy | `#153A52` | 워드마크·단색 |
| Mist | `#F0F7F6` | 배경 |

## 타이포그래피

- 워드마크: 굵기 800, letter-spacing -0.8
- 태그라인: `DROP YOUR BAGS · TRAVEL LIGHT`
- 폰트: Segoe UI / -apple-system / Roboto 계열 시스템 폰트

## 사용 가이드

- 밝은 배경 → `logo-horizontal.svg` 또는 `logo-monochrome.svg`
- 어두운 배경 → `logo-reversed.svg`
- 앱 스토어·파비콘 → `app-icon.svg`
- 로고 주변 여백은 심볼 높이의 최소 25% 이상 확보하세요.

## PNG 내보내기

이 환경에는 SVG 변환 도구가 없어 PNG를 생성하지 못했습니다. 필요 시:

```bash
# 도구 설치 후
rsvg-convert -w 1024 -h 1024 logo/app-icon.svg -o logo/app-icon-1024.png
# 또는
inkscape logo/app-icon.svg --export-type=png -w 1024
```
