// 도메인 상수의 유일한 위치. 공식 원본은 docs/formulas/*.md이며, md에서도 같은 이름으로 참조한다.
// 값이나 이름을 바꿀 때는 md · 이 파일 · 테스트를 한 번에 고친다.

export const MINUTES_PER_DAY = 1440;

/* ---- Time-Safe (docs/formulas/time-safe.md) ---- */
/** 도착편 미조회 시 데모 도착 시각(10:30) */
export const DEFAULT_ARRIVE = 10 * 60 + 30;
/** 연결편 미조회 시 고정 체류 예산(분) */
export const LAYOVER_BUDGET = 360;
// 버퍼 3개 구성 요소. 값과 합계는 근거 확인 후 사용자가 확정한다(docs/STATUS.md "A1-값").
/** ① 입국심사(도착 후, 짐 찾기 포함, 분) — 미정. 0 = 기존 동작 유지. 후보: 기획서 50분(미검증) */
export const ARRIVAL_IMMIGRATION_MIN = 0;
/** ② 보안검색·출국심사(공항 복귀 후, 분) — 레거시 코드 50분, 미검증. T1 실시간 대기의 하한 */
export const DEPARTURE_SECURITY_MIN = 50;
/** ③ 게이트 여유(분) — 레거시 코드 30분("출발 20분 전 탑승 마감 + 여유"), 미검증 */
export const GATE_MARGIN_MIN = 30;
/** 외출 가능 시간이 이보다 적으면 외출 불가(분) */
export const MIN_STAY = 60;
/** 출국장 실시간 대기시간을 제공하는 터미널 코드(제1터미널) */
export const LIVE_SECURITY_TERMINAL = "P01";
/** 온보딩 이후 항공편 재조회 주기 */
export const FLIGHT_POLL_INTERVAL_MS = 120_000;

/* ---- Time-Fit (docs/formulas/time-fit.md) ---- */
/** 코스 준비(짐 맡기기 등, 분) — 외출 가능 시간에서 빼서 코스 가용 시간을 만든다. 미검증 */
export const COURSE_PREP_MIN = 20;
/** 코스 빌더 활동 카테고리(휴식 Rest는 의도적으로 제외) */
export const ACT_KEYS = ["Food", "Massage", "Shopping", "Beauty", "Sightseeing", "Brand"] as const;
/** 이보다 가까우면 도보(직선거리 km) */
export const WALK_MAX_KM = 1.2;
/** 이보다 멀면 대중교통 우선(직선거리 km) */
export const TRANSIT_MIN_KM = 6;
/** 도보 추정 속도(km/h) — 미검증 */
export const WALK_SPEED_KMH = 4.5;
/** 실측 전 실시간 장소 임시 이동시간(분/km, ≈30km/h) — 미검증 */
export const LIVE_PLACE_MIN_PER_KM = 2;

/* ---- 데이유즈 (docs/formulas/dayuse-pricing.md) ---- */
/** 1시간 추가 가격 = 기본가 ÷ 기본시간 × 이 비율 — 근거 없음(미검증) */
export const TIER_STEP_RATIO = 0.5;
/** 추가 가격 반올림 단위(원) */
export const TIER_PRICE_ROUND_KRW = 1000;
/** 체크인 후보 간격(분) */
export const CHECKIN_SLOT_STEP = 30;
/** 체크인 후보 개수 */
export const CHECKIN_SLOT_COUNT = 6;
/** 데이유즈 플랫폼 수수료율 — 사업 계획(2026), 미검증 */
export const DAYUSE_COMMISSION_RATE = 0.12;
/** 액티비티 플랫폼 수수료율 — 사업 계획(2026), 미검증 */
export const ACTIVITY_COMMISSION_RATE = 0.15;
/** 제휴 노출 CPC 범위(원/클릭) — 사업 계획(2026), 미검증 */
export const CPC_MIN_KRW = 200;
export const CPC_MAX_KRW = 500;
