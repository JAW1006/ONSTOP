import { TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { KeyValueRow } from "@/components/ui/key-value-row";
import { useTimeFormat } from "@/features/time-safe/hooks";
import { cn } from "@/lib/utils";
import type { CourseModel } from "./use-course";

type Segment = { key: "prep" | "wait" | "travel" | "stay" | "spare" | "over"; min: number };

const SEGMENT_CLASS: Record<Segment["key"], string> = {
  prep: "bg-role-prep",
  wait: "bg-role-prep",
  travel: "bg-role-route",
  stay: "bg-role-stay",
  spare: "bg-role-spare",
  over: "bg-role-return",
};

/**
 * 막대 구간: 준비 → (체크인 대기) → 이동 → 체류 순으로 쌓고, 가용(외출 가능 시간)을 넘는 부분은 "초과"(빨강)로 자른다.
 * 여유가 있으면 끝에 여유 구간.
 */
export function budgetSegments(prep: number, travel: number, stay: number, available: number, wait = 0): Segment[] {
  const out: Segment[] = [];
  let used = 0;
  for (const [key, min] of [
    ["prep", prep],
    ["wait", wait],
    ["travel", travel],
    ["stay", stay],
  ] as const) {
    const fit = Math.max(0, Math.min(min, available - used));
    if (fit > 0) out.push({ key, min: fit });
    used += min;
  }
  if (used > available) out.push({ key: "over", min: used - available });
  else if (available > used) out.push({ key: "spare", min: available - used });
  return out;
}

/** 지도 아래 고정 요약 패널 — 사용/가용, 시간 예산 막대, 복귀 도착 목표·마지막 출발 기한, 초과 경고 */
export function SummaryPanel({ model }: { model: CourseModel }) {
  const { t } = useTranslation();
  const fmt = useTimeFormat();
  const { summary, course, returnPlan, prepMin } = model;
  const travel = course?.travelMin ?? 0;
  const stay = course?.stayMin ?? 0;
  const wait = course?.waitMin ?? 0;
  const over = summary.remainMin < 0;
  const segments = budgetSegments(prepMin, travel, stay, summary.availableMin, wait);
  const total = Math.max(summary.usedMin, summary.availableMin, 1);
  const labels: Segment[] = [
    { key: "prep", min: prepMin },
    ...(wait ? [{ key: "wait" as const, min: wait }] : []),
    { key: "travel", min: travel },
    { key: "stay", min: stay },
    over ? { key: "over", min: -summary.remainMin } : { key: "spare", min: summary.remainMin },
  ];

  return (
    <section aria-label={t("course.header.title")} className="mt-3 rounded-t-2xl bg-card px-4 pt-4 pb-4 shadow-card">
      <div className="flex items-baseline justify-between gap-2">
        <p className="flex flex-wrap items-baseline gap-1.5">
          <span className="text-title font-black text-ink">
            {t("course.summary.used", { time: fmt.duration(summary.usedMin) })}
          </span>
          <span className="text-body text-sub">
            {t("course.summary.available", { time: fmt.duration(summary.availableMin) })}
          </span>
        </p>
        <Badge variant={over ? "danger" : "success"} className="shrink-0 px-2.5 py-1 text-body">
          {over
            ? t("course.budget.over", { min: -summary.remainMin })
            : t("course.budget.spare", { min: summary.remainMin })}
        </Badge>
      </div>

      <div
        className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-role-spare"
        role="img"
        aria-label={labels.map((s) => t(`course.summary.segment.${s.key}`, { n: s.min })).join(", ")}
      >
        {segments.map((s, i) => (
          <div
            key={i}
            data-segment={s.key}
            className={SEGMENT_CLASS[s.key]}
            style={{ width: `${(s.min / total) * 100}%` }}
          />
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-caption text-sub">
        {labels.map((s) => (
          <li key={s.key} className={cn("flex items-center gap-1", s.key === "over" && "font-bold text-role-return")}>
            <span
              aria-hidden
              className={cn("inline-block size-2.5 rounded-sm border border-line", SEGMENT_CLASS[s.key])}
            />
            {t(`course.summary.segment.${s.key}`, { n: s.min })}
          </li>
        ))}
      </ul>

      {!course && <p className="mt-3 text-caption text-faint">{t("course.summary.noRoom")}</p>}

      {over && (
        <p
          role="alert"
          className="mt-3 flex gap-1.5 rounded-md bg-danger-bg px-3 py-2.5 text-body font-bold text-role-return"
        >
          <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden />
          {t("course.summary.overWarning")}
        </p>
      )}

      {course && returnPlan?.blockOver && returnPlan.blockEndMin != null && (
        <p
          role="alert"
          className="mt-3 flex gap-1.5 rounded-md bg-danger-bg px-3 py-2.5 text-body font-bold text-role-return"
        >
          <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden />
          {t("course.summary.blockOver", {
            time: fmt.time(course.hotelReturnAt),
            end: fmt.time(returnPlan.blockEndMin),
            min: returnPlan.blockOverMin,
          })}
        </p>
      )}

      {course && returnPlan && (
        <div className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3">
          <KeyValueRow size="md" label={t("course.summary.returnTarget")} value={fmt.time(returnPlan.targetMin)} />
          {returnPlan.late ? (
            <div className="flex justify-between gap-3 py-1">
              <span className="text-body text-sub">{t("course.summary.expectedReturn")}</span>
              <span className="text-right text-body font-bold text-role-return">
                {t("course.summary.lateThan", {
                  time: fmt.time(course.returnAt),
                  target: fmt.time(returnPlan.targetMin),
                })}
              </span>
            </div>
          ) : (
            <>
              <KeyValueRow
                size="md"
                label={t(course.stops.length ? "course.summary.lastDeparture" : "course.summary.lastDepartureHotel")}
                value={t("course.summary.until", { time: fmt.time(returnPlan.lastDepartureDeadlineMin) })}
              />
              {course.stops.length > 0 && (
                <KeyValueRow
                  size="md"
                  label={t("course.summary.lastDepartureHotel")}
                  value={t("course.summary.until", { time: fmt.time(returnPlan.hotelDepartureDeadlineMin) })}
                />
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
