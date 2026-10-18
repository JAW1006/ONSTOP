import { useTranslation } from "react-i18next";
import type { IconName } from "./icon";
import { Icon } from "./icon";

export type TabKey = "home" | "luggage" | "course" | "booking" | "my";

const TABS: {
  id: TabKey;
  icon: IconName;
  labelKey: "nav.home" | "nav.luggage" | "nav.course" | "nav.booking" | "nav.my";
}[] = [
  { id: "home", icon: "home", labelKey: "nav.home" },
  { id: "luggage", icon: "bag", labelKey: "nav.luggage" },
  { id: "course", icon: "route", labelKey: "nav.course" },
  { id: "booking", icon: "calendar", labelKey: "nav.booking" },
  { id: "my", icon: "user", labelKey: "nav.my" },
];

/**
 * design/reference/src/App.tsx (nav 렌더, 1325행·1376-1381행) + index.css .tabbar* 이식.
 * 탭 이름은 기존 nav.* i18n 키를 그대로 쓴다(docs/design/i18n-keys.md 이미 5개 언어 검수 완료).
 * 높이는 docs/design/design-tokens.md 3절: 72px + safe-area-inset-bottom, 54/34px 하드코딩 없음.
 */
export function TabBar({ active, onChange }: { active: TabKey; onChange: (id: TabKey) => void }) {
  const { t } = useTranslation();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[60] mx-auto flex w-full max-w-[430px] justify-around border-t border-v2-line bg-v2-paper/96 px-2 pt-1.75"
      style={{
        height: "calc(var(--ts-v2-tabbar-content-height) + env(safe-area-inset-bottom, 0px))",
        paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {TABS.map(({ id, icon, labelKey }) => {
        const isActive = active === id;
        const isFeatured = id === "course";
        return (
          <button
            aria-current={isActive ? "page" : undefined}
            className={
              isFeatured
                ? `-mt-4.5 mx-1 h-16 w-16 flex-none flex-col gap-0.75 rounded-full border-[6px] border-v2-paper text-[11px] shadow-[0_8px_20px_rgba(39,100,231,0.28)] ${isActive ? "bg-v2-brand-dark text-white" : "bg-v2-brand text-white"}`
                : `flex flex-1 flex-col items-center gap-0.75 text-[11px] ${isActive ? "font-bold text-v2-brand" : "text-[#8490a3]"}`
            }
            key={id}
            onClick={() => onChange(id)}
            type="button"
          >
            <Icon name={icon} size={isFeatured ? 22 : 20} />
            <span>{t(labelKey)}</span>
          </button>
        );
      })}
    </nav>
  );
}
