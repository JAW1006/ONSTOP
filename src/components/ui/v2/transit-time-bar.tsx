import { useTranslation } from "react-i18next";
import type { TimeSegment } from "./time-bar";
import { TimeBar } from "./time-bar";

export type TransitSegmentKind = "deduction" | "available";
export type TransitSource = "live" | "baseline";

export type TransitSegment = {
  kind: TransitSegmentKind;
  label: string;
  minutes: number;
  source: TransitSource;
};

/**
 * design/reference/src/App.tsx (TransitTimeBar, lines 148-166) 이식.
 * 범례만 design-tokens.md 5-1절(의도된 차이 b)에 따라 reference의 구간 폭 비례 4열 대신
 * 2열 범례(견본+이름+분+출처 뱃지)로 바꾼다. 그 외 막대·중첩 코스 막대는 그대로 둔다.
 */
export function TransitTimeBar({
  segments,
  courseSegments,
  totalMinutes,
}: {
  segments: TransitSegment[];
  courseSegments?: TimeSegment[];
  totalMinutes: number;
}) {
  const { t } = useTranslation();
  const ariaLabel = t("transitTimeBar.ariaLabel", {
    total: totalMinutes,
    breakdown: segments.map((segment) => `${segment.label} ${t("unit.minutes", { n: segment.minutes })}`).join(", "),
  });
  return (
    <div className="w-full text-left text-v2-ink">
      <div aria-label={ariaLabel} className="flex h-3.5 overflow-hidden rounded-md bg-v2-track">
        {segments.map((segment) => (
          <i
            className={
              segment.kind === "available"
                ? "h-full min-w-0 rounded-[4px] border-2 border-v2-brand bg-v2-brand-soft shadow-[inset_0_0_0_1px_white]"
                : "h-full min-w-0 bg-v2-pale bg-[repeating-linear-gradient(135deg,transparent_0_5px,var(--color-v2-line)_5px_7px)]"
            }
            key={`${segment.label}-${segment.minutes}`}
            style={{ flex: segment.minutes }}
          />
        ))}
      </div>
      <div className="mt-1.75 grid grid-cols-2 gap-x-3 gap-y-2">
        {segments.map((segment) => (
          <span className="flex min-w-0 items-center gap-1.75" key={segment.label}>
            <i
              className={`h-2.25 w-2.25 flex-none rounded-sm ${segment.kind === "available" ? "border-2 border-v2-brand bg-v2-brand-soft" : "bg-v2-pale bg-[repeating-linear-gradient(135deg,transparent_0_2px,var(--color-v2-line)_2px_3px)]"}`}
            />
            <span className="flex min-w-0 flex-col">
              <strong className="text-[11px] overflow-wrap-anywhere">{segment.label}</strong>
              <span className="flex items-center gap-1.5">
                <b className="text-xs">{t("unit.minutes", { n: segment.minutes })}</b>
                <small className="rounded-full border border-v2-line bg-v2-paper px-1.25 py-0.75 text-[11px] text-v2-ink-soft">
                  {segment.source === "live" ? t("common.badge.live") : t("timeBar.source.baseline")}
                </small>
              </span>
            </span>
          </span>
        ))}
      </div>
      {courseSegments && (
        <div className="mt-2.25 rounded-lg border border-v2-brand bg-v2-brand-soft p-1.5">
          <small className="mb-1.25 block text-[11px] font-bold text-v2-brand">
            {t("transitTimeBar.nestedCourse")}
          </small>
          <TimeBar compact segments={courseSegments} />
        </div>
      )}
    </div>
  );
}
