// 코스 빌더·저장된 코스 공용 계산 모델 — 공식: docs/formulas/time-fit.md "순차 경로"
import { roomById, type CoursePlace } from "@/data";
import { COURSE_PREP_MIN, LIVE_SECURITY_TERMINALS } from "@/domain/constants";
import { alignCheckIn, returnPlan, scheduleSummary, sequentialCourse } from "@/domain/time-fit";
import { useTimeSafe } from "@/features/time-safe/hooks";
import { routePoints, useRouteLegs } from "./route";

/**
 * live = true: 확정된(저장된) 코스 — 실제 경로 조회. false: 코스 빌더 — 보수적 근사만.
 * booking: 이 숙소에 진행 중인 예약 요청의 체크인 슬롯·이용 종료. 있으면 코스를 슬롯에 맞추고(늦으면 전체 지연)
 * 숙소 복귀 ≤ 이용 종료를 판정한다(B1). 없으면 null
 */
export function useCourseModel(
  roomId: string | null,
  plan: readonly CoursePlace[],
  { live, booking = null }: { live: boolean; booking?: { checkInMin: number; endMin: number } | null },
) {
  const ts = useTimeSafe();
  const room = roomById(roomId) ?? null;
  const points = routePoints(room?.coord ?? null, plan);
  const { legs, loading } = useRouteLegs(points, { live });
  const { result } = ts;
  const raw = room
    ? sequentialCourse(
        result.exitAtMin,
        legs.map((l) => l.min),
        plan.map((p) => p.durMin),
      )
    : null;
  const course = raw && booking ? alignCheckIn(raw, booking.checkInMin) : raw;
  const summary = scheduleSummary(result.outingMin, course?.usedMin ?? 0);
  const plan_ = course ? returnPlan(result.returnByMin, course, booking?.endMin ?? null) : null;
  const terminal = ts.arrival.data?.terminal ? (LIVE_SECURITY_TERMINALS[ts.arrival.data.terminal] ?? null) : null;

  return {
    room,
    legs,
    booking,
    routeLoading: loading,
    live,
    course,
    summary,
    returnPlan: plan_,
    canGoOut: result.canGoOut,
    outingMin: result.outingMin,
    exitAtMin: result.exitAtMin,
    returnByMin: result.returnByMin,
    prepMin: COURSE_PREP_MIN,
    arrivalFlightId: ts.arrival.data?.flightId ?? null,
    arrivalTerminal: terminal,
  };
}

export type CourseModel = ReturnType<typeof useCourseModel>;
