import { useTranslation } from "react-i18next";

export type TimeSegmentKind = "prep" | "travel" | "stay" | "margin" | "overrun";

export type TimeSegment = {
  kind: TimeSegmentKind;
  label: string;
  width: number;
};

const kindBg: Record<TimeSegmentKind, string> = {
  prep: "bg-v2-prep",
  travel: "bg-v2-travel",
  stay: "bg-v2-stay",
  margin: "bg-v2-margin",
  overrun: "bg-v2-danger",
};

/**
 * design/reference/src/App.tsx (TimeBar, lines 120-146) 이식.
 * reference는 정수별 .timebar i[data-size="N"] 고정 클래스로 폭을 흉내 낸다(실제로는 비례하지 않음) —
 * design-tokens.md 5절 "폭은 분 비율로 계산한다. 고정 퍼센트 금지"에 맞춰 flex 값을 직접 계산한다.
 */
export function TimeBar({ compact = false, segments }: { compact?: boolean; segments: TimeSegment[] }) {
  const { t } = useTranslation();
  const totalMinutes = segments.reduce((total, segment) => total + segment.width, 0);
  return (
    <div className="w-full">
      {!compact && (
        <div className="mb-1.75 flex justify-between text-[11px] text-v2-ink-soft">
          {segments.map((segment) => (
            <span key={`${segment.kind}-${segment.label}`}>{segment.label}</span>
          ))}
        </div>
      )}
      <div
        aria-label={t("timeBar.ariaLabel", {
          segments: segments.map((segment) => segment.label).join(", "),
          total: totalMinutes,
        })}
        className={`flex overflow-hidden rounded-full bg-v2-track ${compact ? "h-2" : "h-2.5"}`}
      >
        {segments.map((segment) => (
          <i
            className={`block h-full ${kindBg[segment.kind]}`}
            key={`${segment.kind}-${segment.label}`}
            style={{ flex: segment.width }}
          />
        ))}
      </div>
      {!compact && (
        <div className="mt-3 flex gap-4.5 text-[11px] text-v2-ink-soft">
          <span className="flex items-center gap-1.25">
            <i className="h-2.25 w-2.25 rounded-sm bg-v2-prep" />
            {t("timeBar.legend.prep")}
          </span>
          <span className="flex items-center gap-1.25">
            <i className="h-2.25 w-2.25 rounded-sm bg-v2-travel" />
            {t("timeBar.legend.travel")}
          </span>
          <span className="flex items-center gap-1.25">
            <i className="h-2.25 w-2.25 rounded-sm bg-v2-stay" />
            {t("timeBar.legend.stay")}
          </span>
          <span className="flex items-center gap-1.25">
            <i className="h-2.25 w-2.25 rounded-sm bg-v2-margin" />
            {t("timeBar.legend.margin")}
          </span>
        </div>
      )}
    </div>
  );
}
