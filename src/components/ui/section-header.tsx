import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

/** 섹션 제목 + 부제 + (선택) 더보기 */
export function SectionHeader({
  title,
  subtitle,
  onMore,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  onMore?: () => void;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={cn("mb-3 flex items-end justify-between", className)}>
      <div>
        <h2 className="text-section font-extrabold text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-caption text-faint">{subtitle}</p>}
      </div>
      {onMore && (
        <button type="button" onClick={onMore} className="flex cursor-pointer items-center gap-0.5 text-body text-sub">
          {t("common.more")} <ChevronRight size={14} aria-hidden />
        </button>
      )}
    </div>
  );
}
