import { CalendarCheck, House, Luggage, Route, User, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";

// 하단 탭: 홈 / 짐 케어 / 코스(가운데 FAB) / 예약 / 마이 — docs/design/screens/app-shell.md
// 예약 탭은 /bookings와 /booking/:roomId 둘 다에서 활성이라 NavLink 대신 직접 판정한다.
export function TabBar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const under = (base: string) => pathname === base || pathname.startsWith(`${base}/`);

  return (
    <nav
      aria-label="TimeStay"
      className="absolute inset-x-0 bottom-0 flex h-(--ts-nav-height) items-center justify-around border-t border-line bg-card pb-1"
    >
      <TabItem to="/" active={pathname === "/"} icon={House} label={t("nav.home")} />
      <TabItem to="/luggage" active={under("/luggage")} icon={Luggage} label={t("nav.luggage")} />
      <Link
        to="/course"
        aria-current={under("/course") ? "page" : undefined}
        className="-mt-[22px] flex size-(--ts-fab-size) flex-col items-center justify-center rounded-full [background:var(--ts-grad-primary)] text-primary-foreground shadow-fab"
      >
        <Route size={20} aria-hidden />
        <span className="mt-px text-[8px] font-bold">{t("nav.course")}</span>
      </Link>
      <TabItem
        to="/bookings"
        active={under("/bookings") || under("/booking")}
        icon={CalendarCheck}
        label={t("nav.booking")}
      />
      <TabItem to="/my" active={under("/my")} icon={User} label={t("nav.my")} />
    </nav>
  );
}

function TabItem({ to, active, icon: Icon, label }: { to: string; active: boolean; icon: LucideIcon; label: string }) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cn("flex w-15 flex-col items-center gap-[3px]", active ? "text-blue" : "text-faint")}
    >
      <Icon size={20} aria-hidden />
      <span className={cn("text-micro", active ? "font-bold" : "font-medium")}>{label}</span>
    </Link>
  );
}
