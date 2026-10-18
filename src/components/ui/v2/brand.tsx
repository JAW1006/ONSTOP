import { useTranslation } from "react-i18next";
import { APP_NAME } from "@/branding";

/** design/reference/src/App.tsx (Brand, lines 168-176) + index.css .brand* 그대로 이식. */
export function Brand() {
  const { t } = useTranslation();
  const subtitle = t("brand.subtitle");
  return (
    <div className="flex items-center gap-1.5 font-[var(--font-v2-display)] text-xl font-bold tracking-tight">
      <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full border-2 border-v2-brand">
        <span className="block h-1.75 w-0.5 origin-bottom -translate-y-0.75 rotate-[42deg] bg-v2-brand" />
      </span>
      <span>{APP_NAME}</span>
      {subtitle && (
        <small className="ml-px text-[11px] font-semibold tracking-normal text-v2-ink-soft">{subtitle}</small>
      )}
    </div>
  );
}
