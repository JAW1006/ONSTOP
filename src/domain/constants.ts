// 도메인 상수의 유일한 위치. 공식 원본은 docs/formulas/*.md이며, md에서도 같은 이름으로 참조한다.
// 값이나 이름을 바꿀 때는 md · 이 파일 · 테스트를 한 번에 고친다.

export const MINUTES_PER_DAY = 1440;

/* ---- Time-Safe (docs/formulas/time-safe.md) ---- */
/** 도착편 미조회 시 데모 도착 시각(10:30) */
export const DEFAULT_ARRIVE = 10 * 60 + 30;
/** 연결편 미조회 시 고정 체류 예산(분) */
export const LAYOVER_BUDGET = 360;
/** 수속(보안검색·출국심사) 폴백값(분) — 미검증 */
export const SECURITY_BUFFER_MIN = 50;
/** 게이트 마감 버퍼(분) — 미검증 */
export const GATE_CUTOFF_MIN = 30;
/** 이보다 적게 남으면 외출 불가(분) */
export const MIN_STAY = 60;
/** 출국장 실시간 대기시간을 제공하는 터미널 코드(제1터미널) */
export const LIVE_SECURITY_TERMINAL = "P01";
/** 온보딩 이후 항공편 재조회 주기 */
export const FLIGHT_POLL_INTERVAL_MS = 120_000;

/* ---- Time-Fit (docs/formulas/time-fit.md) ---- */
/** 짐 맡기기/준비(분) — 미검증 */
export const PREP = 20;
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
