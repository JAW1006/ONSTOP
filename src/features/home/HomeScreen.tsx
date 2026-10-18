import { ChevronRight, Luggage } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { categoryIcon, CATEGORIES } from "@/app/categories";
import { useTrip } from "@/app/trip-state";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Card } from "@/components/ui/card";
import { Photo } from "@/components/ui/photo";
import { SectionHeader } from "@/components/ui/section-header";
import { useAppMode } from "@/app/app-mode";
import { HOT_PLACES, localize, type Place } from "@/data";
import { listedRooms } from "@/data/partners";
import { RoomCard } from "@/features/dayuse/RoomCard";
import { useTimeSafe } from "@/features/time-safe/hooks";
import { TimeSafeSummaryCard } from "@/features/time-safe/TimeSafeSummaryCard";
import { formatKrw } from "@/lib/format";
import { cn } from "@/lib/utils";

/** 홈 — docs/design/screens/home.md */
export function HomeScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { interests, savedCourse } = useTrip();
  // 저장된 코스가 있으면 저장 화면으로(레거시 goToCourse)
  const courseHref = savedCourse ? "/course/saved" : "/course";
  const { result } = useTimeSafe();
  const canGoOut = result.canGoOut;
  const [hot, setHot] = useState<Place | null>(null);
  const { demo } = useAppMode();
  const rooms = listedRooms(demo);
  const firstRoom = rooms[0];

  return (
    <div>
      <header className="rounded-b-3xl px-5 pt-[34px] pb-5 text-white [background:var(--ts-grad-primary)]">
        <BrandLogo height={30} />
        <h1 className="mt-3.5 text-title font-black">{t("home.greeting")}</h1>
        <p className="mt-0.5 text-body opacity-90">{t("home.subtitle")}</p>
      </header>

      <div className="px-4 pt-4 pb-5">
        <TimeSafeSummaryCard />

        {/* Time-Fit — 외출 불가면 비활성 */}
        <SectionHeader
          title={t("home.timeFit.title")}
          subtitle={t("home.timeFit.subtitle")}
          onMore={canGoOut ? () => navigate(courseHref) : undefined}
        />
        <button
          type="button"
          disabled={!canGoOut}
          onClick={() => navigate(courseHref)}
          className="mb-[18px] block w-full cursor-pointer text-left disabled:cursor-not-allowed disabled:opacity-55"
        >
          <Card className="p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {CATEGORIES.map(({ key, icon: Icon, labelKey }) => {
                const on = interests.includes(key);
                return (
                  <span
                    key={key}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-[11px] py-[7px] text-body font-bold",
                      on ? "bg-tint text-blue-deep" : "bg-background text-sub",
                    )}
                  >
                    <Icon size={13} aria-hidden /> {t(labelKey)}
                  </span>
                );
              })}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body text-sub">
                {canGoOut ? (
                  <>
                    {t("home.timeFit.build.prefix")} <b className="text-ink">{t("home.timeFit.build.bold")}</b>
                    {t("home.timeFit.build.suffix")}
                  </>
                ) : (
                  t("timeSafe.cannotGoOut.title")
                )}
              </span>
              {canGoOut && (
                <span className="flex items-center gap-0.5 text-body font-extrabold text-blue">
                  {t("home.timeFit.build.cta")} <ChevronRight size={15} aria-hidden />
                </span>
              )}
            </div>
          </Card>
        </button>

        {/* 데이유즈 — 운영은 참여 확정 호텔만(없으면 영역 숨김) */}
        {firstRoom && (
          <>
            <SectionHeader
              title={t("home.dayuse.title")}
              subtitle={t("home.dayuse.subtitle")}
              onMore={() => navigate(`/booking/${firstRoom.id}`)}
            />
            <ul className="mb-2 flex gap-3 overflow-x-auto pb-1.5" aria-label={t("home.dayuse.title")}>
              {rooms.map((room) => (
                <li key={room.id}>
                  <RoomCard room={room} />
                </li>
              ))}
            </ul>
          </>
        )}

        {/* 짐 케어 */}
        <Link to="/luggage" className="mb-5 flex items-center justify-between rounded-lg bg-danger-bg px-4 py-[13px]">
          <span>
            <span className="block text-body font-extrabold text-red">{t("home.luggageBanner.title")}</span>
            <span className="mt-0.5 block text-caption text-sub">{t("home.luggageBanner.subtitle")}</span>
          </span>
          <Luggage size={24} className="text-red" aria-hidden />
        </Link>

        {/* 핫플레이스(제휴) */}
        <SectionHeader title={t("home.hotPlaces.title")} subtitle={t("home.hotPlaces.subtitle")} />
        <ul className="mb-2 flex gap-3 overflow-x-auto pb-1.5" aria-label={t("home.hotPlaces.title")}>
          {HOT_PLACES.map((p) => {
            const Icon = categoryIcon(p.cat);
            return (
              <li key={p.id} className="min-w-[132px] shrink-0">
                <button type="button" onClick={() => setHot(p)} className="w-full cursor-pointer text-left">
                  <Photo
                    icon={<Icon size={22} color="#fff" />}
                    tint={p.tint}
                    height={82}
                    badge={t("common.badge.partnerAd")}
                  />
                  <span className="mt-1.5 block text-body font-bold text-ink">{localize(p.name, i18n.language)}</span>
                  <span className="block text-micro text-faint">
                    {localize(p.area, i18n.language)} · {t("unit.transferMin", { n: p.moveMin })}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <BottomSheet
        open={!!hot}
        onOpenChange={(o) => !o && setHot(null)}
        title={hot ? localize(hot.name, i18n.language) : ""}
      >
        {hot && <HotPlaceDetail place={hot} />}
      </BottomSheet>
    </div>
  );
}

function HotPlaceDetail({ place }: { place: Place }) {
  const { t, i18n } = useTranslation();
  const Icon = categoryIcon(place.cat);
  return (
    <div className="flex flex-col gap-2.5">
      <Photo
        icon={<Icon size={28} color="#fff" />}
        tint={place.tint}
        height={120}
        badge={t("common.badge.partnerAd")}
      />
      <p className="text-body text-sub">{localize(place.area, i18n.language)}</p>
      <div className="flex flex-wrap gap-2">
        <Badge className="px-2.5 py-1.5 text-body">{t("unit.transferMin", { n: place.moveMin })}</Badge>
        <Badge className="px-2.5 py-1.5 text-body">{t("unit.stayMin", { n: place.durMin })}</Badge>
        {place.price > 0 && <Badge className="px-2.5 py-1.5 text-body">{formatKrw(place.price)}~</Badge>}
      </div>
    </div>
  );
}
