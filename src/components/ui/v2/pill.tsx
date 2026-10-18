import type { ReactNode } from "react";

/** design/reference/src/App.tsx (Pill, line 178) + index.css .pill* 그대로 이식. */
export type PillTone = "neutral" | "positive" | "blue" | "gold" | "danger" | "outline";

const toneClass: Record<PillTone, string> = {
  neutral: "bg-v2-pale text-v2-ink-soft",
  positive: "bg-v2-success-soft text-v2-success-ink",
  blue: "bg-v2-brand-soft text-v2-brand",
  gold: "bg-v2-gold-soft text-v2-gold-ink",
  danger: "bg-v2-danger-soft text-v2-danger-ink",
  outline: "border border-v2-line bg-v2-paper text-v2-ink-soft",
};

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: PillTone }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-[var(--font-v2-display)] text-[11px] font-bold tracking-wide whitespace-nowrap ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}
