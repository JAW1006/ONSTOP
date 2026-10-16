import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

/** 화면 상단 흰 헤더(레거시 Top): 뒤로가기 + 제목/부제 */
export function PageHeader({ title, subtitle, onBack }: { title: ReactNode; subtitle?: ReactNode; onBack?: () => void }) {
  const { t } = useTranslation();
  return (
    <header className="flex items-center gap-2.5 border-b border-line bg-card px-4 pt-[34px] pb-3.5">
      {onBack && (
        <button type="button" onClick={onBack} aria-label={t("common.back")} className="cursor-pointer text-ink">
          <ChevronLeft size={22} aria-hidden />
        </button>
      )}
      <div>
        <h1 className="text-section font-extrabold text-ink">{title}</h1>
        {subtitle && <p className="text-micro text-faint">{subtitle}</p>}
      </div>
    </header>
  );
}
