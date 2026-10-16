# 화면 명세

> 상태: 초안 · 최종 수정 2026-10-16

화면을 이식하기 **전에** `<화면>.md`를 먼저 쓴다. 이식 후 레거시와 비교한 결과는 `docs/results/`에 남긴다.

## 이식 순서·상태
| 순서 | 화면 | 명세 | 레거시 컴포넌트 | 라우트(안) | 상태 |
|---|---|---|---|---|---|
| 0 | 앱 골격(프레임·탭바·라우트) | [app-shell](app-shell.md) | `App`, `Nav` | 전체 | 완료(3단계) |
| 1 | Time-Safe(온보딩 3단계) | [time-safe](time-safe.md) | `Onboarding` step 0–2 | `/onboarding` | 완료 — [비교 기록](../../results/2026-10-16-time-safe-screen.md) |
| 2 | 홈 | [home](home.md) | `HomeScreen`, `FlightNotice` | `/` | 완료 — [비교 기록](../../results/2026-10-16-home-screen.md) |
| 3 | 코스 지도 | [course-map](course-map.md) | `Course`, `CourseMap`, `SavedCourseScreen` | `/course`, `/course/saved` | 완료 — [비교 기록](../../results/2026-10-16-course-map-compare.md), 실제 지도는 사용자 확인 대기 |
| 4 | 데이유즈 예약 | — | `Booking`, `Confirm` | `/booking/:roomId`, `/bookings` | 대기 |
| 5 | 짐 케어 / 마이 | — | `Luggagepage`, `MyPage` | `/luggage`, `/my` | 대기 |

## 명세 템플릿
```md
# <화면명>
> 상태: 초안 · 레거시: `<컴포넌트>`
## 목적
## 진입/이탈 (라우트, 이전·다음 화면)
## 구성 (위→아래 블록 표)
## 상태·데이터 (props, 쿼리, 사용하는 domain 함수)
## 빈/오류/로딩 상태
## 레거시와 다르게 하는 점 (있으면 근거)
```
