import { useQuery } from "@tanstack/react-query";
import { Bed, Check, Footprints, Route, TrainFront, CarTaxiFront } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { categoryIcon, CATEGORIES } from "@/app/categories";
import { useTrip } from "@/app/trip-state";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { AD_PLACE_IDS, localize, PLACES, roomImage, ROOMS, type CoursePlace } from "@/data";
import { ACT_KEYS } from "@/domain/constants";
import { autoBuildSequential, courseAvailableMin, wouldFitSequential } from "@/domain/time-fit";
import type { TravelMode } from "@/domain/travel";
import { formatKrw } from "@/lib/format";
import { cn } from "@/lib/utils";
import { fetchNearby, type TravelResult } from "./api";
import { CourseMap } from "./CourseMap";
import { CourseTimeline } from "./CourseTimeline";
import { approxResult, useApproxLegsFor, type RouteLeg } from "./route";
import { SummaryPanel } from "./SummaryPanel";
import { useCourseModel, type CourseModel } from "./use-course";

const MODE_ICON: Record<TravelMode, typeof Footprints> = { walk: Footprints, transit: TrainFront, drive: CarTaxiFront };
const ACTIVITY_CATEGORIES = CATEGORIES.filter((c) => (ACT_KEYS as readonly string[]).includes(c.key));
const VISIBLE_PLACES = 6;

/** 레거시 initSel: 관심사 중 활동 카테고리(휴식 제외), 없으면 쇼핑 */
function initialCats(interests: readonly string[]) {
  const sel = interests.filter((k) => (ACT_KEYS as readonly string[]).includes(k));
  return sel.length ? sel : ["Shopping"];
}

/** 코스 빌더 — docs/design/screens/course-map.md */
export function CourseScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const trip = useTrip();
  const lang = i18n.language;
  const cats = trip.courseCats ?? initialCats(trip.interests);
  const plan = trip.coursePlan;
  // 코스 빌더는 실제 경로를 조회하지 않는다(보수적 근사) — 저장하면 저장된 코스 화면에서 실제 경로 조회
  const model = useCourseModel(trip.courseRoomId, plan, { live: false });
  const room = model.room;
  const locked = !model.canGoOut;
  const [selectedLeg, setSelectedLeg] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [info, setInfo] = useState<CoursePlace | null>(null);
  // 자동 추천이 아무것도 못 담았을 때 안내 — 그때 만든 일정·숙소·카테고리가 그대로일 때만 보인다
  const [emptyResult, setEmptyResult] = useState<{ plan: CoursePlace[]; key: string } | null>(null);
  const contextKey = `${room?.id}|${cats.join(",")}`;
  const autoEmpty = !!emptyResult && emptyResult.plan === plan && emptyResult.key === contextKey;

  useEffect(() => setSelectedLeg(null), [room?.id, plan.length]);
  useEffect(() => setShowAll(false), [room?.id, cats.join(",")]);

  // 숙소 주변 실제 장소(카카오 로컬) — 담을 수 있는 업종 + 참고용 점
  const nearby = useQuery({
    queryKey: ["nearby", room?.id],
    queryFn: () => fetchNearby(room!.coord),
    enabled: !!room,
    staleTime: Infinity,
    retry: false,
  });
  const candidates = useMemo(
    () => [...PLACES.filter((p) => cats.includes(p.cat)), ...(nearby.data?.addable ?? []).filter((p) => cats.includes(p.cat))],
    [cats, nearby.data],
  );

  // 숙소→후보 이동시간: 보수적 근사만(후보 구간 미리 조회 안 함 — ODsay 쿼터 확인 전, 2026-10-16 결정)
  const hotelTo = (p: CoursePlace): TravelResult => (room ? approxResult(room.coord, p.coord) : { min: 0, mode: "walk", approx: true, path: null, distanceM: null, transfers: null, fare: null });
  const sorted = [...candidates].sort((a, b) => hotelTo(a).min - hotelTo(b).min);
  const visible = room ? (showAll ? sorted : sorted.slice(0, VISIBLE_PLACES)) : [];
  const legsFor = useApproxLegsFor(room?.coord ?? null);
  const available = courseAvailableMin(model.outingMin);
  const inPlan = (p: CoursePlace) => plan.some((x) => x.id === p.id);
  const fits = (p: CoursePlace) => !!room && wouldFitSequential(available, legsFor, plan, p);
  const toggle = (p: CoursePlace) => trip.setCoursePlan((prev) => (prev.some((x) => x.id === p.id) ? prev.filter((x) => x.id !== p.id) : [...prev, p]));
  const autoBuild = () => {
    if (!room) return;
    const picked = autoBuildSequential({
      selected: cats,
      interests: trip.interests,
      places: candidates.map((p) => ({ ...p, rankMove: hotelTo(p).min })),
      legsFor,
      availableMin: available,
    });
    const next = picked.map(({ rankMove: _r, ...p }) => p);
    trip.setCoursePlan(next);
    setEmptyResult(next.length === 0 ? { plan: next, key: contextKey } : null);
  };
  const save = () => {
    if (!room) return;
    trip.setSavedCourse({ roomId: room.id, plan, cats });
    navigate("/course/saved");
  };

  return (
    <div>
      <CourseHeader model={model} onBack={() => navigate("/")} />
      <div className="p-4">
        {locked && <CannotGoOutBox />}

        <p className="mb-2 text-micro text-faint">{room ? t("course.map.allPlacesNote") : t("course.map.pickRoomNote")}</p>
        <CourseMap
          roomId={room?.id ?? null}
          plan={plan}
          legs={model.legs}
          candidates={room ? candidates : []}
          refPois={nearby.data?.ref ?? []}
          selectedLeg={selectedLeg}
          onSelectLeg={setSelectedLeg}
          onSelectRoom={(id) => !locked && trip.setCourseRoomId(id)}
          onPlaceClick={setInfo}
        />
        {room && model.legs.length > 0 && <p className="mt-2 text-micro text-faint">{t("course.map.legend")}</p>}
        {selectedLeg != null && model.legs[selectedLeg] && <LegDetail leg={model.legs[selectedLeg]!} />}

        <SummaryPanel model={model} />

        <h2 className="mt-5 mb-2 text-body font-extrabold text-ink">
          {t("course.room.title")} <span className="font-bold text-red">{t("course.room.required")}</span>
        </h2>
        <ul className="mb-5 flex gap-2.5 overflow-x-auto pb-1.5" aria-label={t("course.room.title")}>
          {ROOMS.map((r) => {
            const on = r.id === room?.id;
            return (
              <li key={r.id} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={on}
                  disabled={locked}
                  onClick={() => trip.setCourseRoomId(r.id)}
                  className={cn("block w-[152px] cursor-pointer rounded-lg p-2.5 text-left disabled:cursor-not-allowed disabled:opacity-55", on ? "border-2 border-blue bg-tint" : "border border-line bg-card")}
                >
                  <div className="relative flex h-[60px] items-center justify-center overflow-hidden rounded-sm" style={{ background: r.tint }}>
                    {roomImage(r) ? <img src={roomImage(r)} alt="" className="size-full object-cover" /> : <Bed size={24} color="#fff" aria-hidden />}
                    {on && (
                      <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-blue text-white">
                        <Check size={13} aria-hidden />
                      </span>
                    )}
                  </div>
                  <span className="mt-2 block text-body font-extrabold text-ink">{localize(r.name, lang)}</span>
                  <span className="mt-0.5 block text-micro text-faint">
                    {t("unit.minFromAirport", { n: r.distMin })} · {t("unit.hourRange", { a: r.hourMin, b: r.hourMax })}
                  </span>
                  <span className="mt-1 block text-body font-extrabold text-blue-deep">{formatKrw(r.price)}~</span>
                </button>
              </li>
            );
          })}
        </ul>

        <h2 className="mb-2 text-body font-extrabold text-ink">
          {t("course.category.title")} <span className="font-medium text-faint">{t("course.category.note")}</span>
        </h2>
        <div className="mb-2.5 flex gap-1.5 overflow-x-auto pb-2">
          {ACTIVITY_CATEGORIES.map((c) => (
            <Chip
              key={c.key}
              active={cats.includes(c.key)}
              disabled={locked}
              onClick={() => trip.setCourseCats(cats.includes(c.key) ? cats.filter((k) => k !== c.key) : [...cats, c.key])}
            >
              {t(c.labelKey)}
            </Chip>
          ))}
        </div>

        <Button size="md" className="w-full" disabled={!room || locked} onClick={autoBuild}>
          <Route size={16} aria-hidden /> {t("course.autoBuild.cta")}
        </Button>
        <p className="mt-1 mb-1 text-center text-micro text-faint">{t("course.autoBuild.note")}</p>
        {autoEmpty && (
          <p role="alert" className="mb-1 rounded-md bg-danger-bg px-3 py-2 text-center text-caption font-bold text-role-return">
            {t("course.autoBuild.empty")}
          </p>
        )}
        {room && <p className="mb-3.5 text-center text-micro text-faint">{t("course.route.estimateNote")}</p>}

        <SectionHeader
          title={t("course.places.title")}
          subtitle={
            room
              ? cats.length
                ? t("course.places.combined", { list: cats.map((k) => t(CATEGORIES.find((c) => c.key === k)!.labelKey)).join(" · ") })
                : t("course.places.chooseCategory")
              : t("course.places.chooseRoomFirst")
          }
        />
        <section aria-label={t("course.places.title")} className="mb-5 flex flex-col gap-2.5">
          {!room && <Card className="p-5 text-center text-caption text-faint">{t("course.places.roomFirstHint")}</Card>}
          {visible.map((p) => (
            <PlaceCard key={p.id} place={p} travel={hotelTo(p)} on={inPlan(p)} fits={fits(p)} locked={locked} onToggle={() => toggle(p)} onInfo={() => setInfo(p)} />
          ))}
          {room && !showAll && sorted.length > VISIBLE_PLACES && (
            <Button variant="outline" size="md" className="w-full" onClick={() => setShowAll(true)}>
              {t("common.showMoreCount", { n: sorted.length - VISIBLE_PLACES })}
            </Button>
          )}
        </section>

        <SectionHeader
          title={t("course.schedule.title")}
          subtitle={room ? t("course.schedule.summary", { n: plan.length, h: Math.floor(model.summary.usedMin / 60), m: model.summary.usedMin % 60 }) : t("course.schedule.emptyHint")}
        />
        {room ? (
          <>
            <CourseTimeline model={model} plan={plan} onRemove={locked ? undefined : (id) => trip.setCoursePlan((prev) => prev.filter((x) => x.id !== id))} />
            <Button className={cn("mt-4", model.summary.remainMin < 0 && "opacity-60")} disabled={locked} onClick={save}>
              {t("course.save")}
            </Button>
          </>
        ) : (
          <Card className="p-6 text-center text-body text-faint">
            <Bed size={26} className="mx-auto text-faint" aria-hidden />
            <p className="mt-2">
              {t("course.schedule.pickRoom.prefix")} <b className="text-blue">{t("course.schedule.pickRoom.bold")}</b>
              {t("course.schedule.pickRoom.suffix")}
            </p>
          </Card>
        )}
      </div>

      <BottomSheet open={!!info} onOpenChange={(o) => !o && setInfo(null)} title={info ? localize(info.name, lang) : ""}>
        {info && (
          <PlaceDetail
            place={info}
            travel={hotelTo(info)}
            on={inPlan(info)}
            fits={fits(info)}
            locked={locked || !room}
            onToggle={() => {
              toggle(info);
              setInfo(null);
            }}
          />
        )}
      </BottomSheet>
    </div>
  );
}

export function CourseHeader({ model, onBack, titleKey = "course.header.title" }: { model: CourseModel; onBack: () => void; titleKey?: "course.header.title" | "savedCourse.title" }) {
  const { t } = useTranslation();
  const meta = [model.arrivalFlightId, model.arrivalTerminal ? t("course.header.terminal", { terminal: model.arrivalTerminal }) : null].filter(Boolean).join(" · ");
  return (
    <div className="relative">
      <PageHeader title={t(titleKey)} onBack={onBack} />
      {meta && <span className="absolute right-4 bottom-4 text-caption text-sub">{meta}</span>}
    </div>
  );
}

export function CannotGoOutBox() {
  const { t } = useTranslation();
  return (
    <div role="alert" className="mb-3 rounded-md border border-red bg-danger-bg px-3 py-2.5">
      <p className="text-body font-extrabold text-red">{t("timeSafe.cannotGoOut.title")}</p>
      <p className="mt-1 text-caption leading-normal text-sub">{t("onboarding.flights.cannotGoOutHint")}</p>
    </div>
  );
}

export function LegDetail({ leg }: { leg: RouteLeg }) {
  const { t } = useTranslation();
  const mode = t(leg.mode === "transit" ? "course.leg.mode.transit" : leg.mode === "walk" ? "course.leg.mode.walk" : "course.leg.mode.taxi");
  const parts = [
    leg.isReturn ? t("course.leg.return") : null,
    mode,
    leg.approx ? t("course.leg.approxMinutes", { n: leg.min }) : t("course.leg.minutes", { n: leg.min }),
    leg.distanceM != null ? t("course.leg.km", { km: (leg.distanceM / 1000).toFixed(1) }) : null,
    leg.transfers != null ? t("course.leg.transfers", { n: leg.transfers }) : null,
    leg.fare != null ? formatKrw(leg.fare) : null,
  ].filter(Boolean);
  return (
    <p role="status" className={cn("mt-2 rounded-md px-3 py-2 text-caption font-bold", leg.isReturn ? "bg-danger-bg text-role-return" : "bg-tint text-role-route-text")}>
      {parts.join(" · ")}
    </p>
  );
}

/** 코스 화면 카테고리 배지: 회색 + 아이콘·글자(카테고리 색 안 씀 — 2026-10-16 결정 3) */
function CategoryTag({ cat }: { cat: CoursePlace["cat"] }) {
  const { t } = useTranslation();
  const Icon = categoryIcon(cat);
  const label = CATEGORIES.find((c) => c.key === cat)!.labelKey;
  return (
    <Badge variant="neutral" className="gap-0.5">
      <Icon size={10} aria-hidden /> {t(label)}
    </Badge>
  );
}

function TravelText({ travel }: { travel: TravelResult }) {
  const { t } = useTranslation();
  const ModeIcon = MODE_ICON[travel.mode];
  return (
    <>
      <ModeIcon size={11} aria-hidden />
      <span>{travel.approx ? t("course.leg.approxMinutes", { n: travel.min }) : t("unit.transferMin", { n: travel.min })}</span>
    </>
  );
}

function PlaceCard({ place, travel, on, fits, locked, onToggle, onInfo }: { place: CoursePlace; travel: TravelResult; on: boolean; fits: boolean; locked: boolean; onToggle: () => void; onInfo: () => void }) {
  const { t, i18n } = useTranslation();
  const Icon = categoryIcon(place.cat);
  const name = localize(place.name, i18n.language);
  return (
    <Card className={cn("flex items-center gap-3 p-3", on ? "border-2 border-blue" : "border border-line")}>
      <div className="flex size-[46px] shrink-0 items-center justify-center rounded-md bg-muted text-sub">
        <Icon size={20} aria-hidden />
      </div>
      <button type="button" onClick={onInfo} className="min-w-0 flex-1 cursor-pointer text-left">
        <span className="flex flex-wrap items-center gap-1.5">
          <CategoryTag cat={place.cat} />
          {AD_PLACE_IDS.has(place.id) && <Badge variant="ad">{t("common.badge.partnerAd")}</Badge>}
          <span className="text-emph font-extrabold text-ink">{name}</span>
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-1 text-caption text-faint">
          <span>{localize(place.area, i18n.language)} ·</span>
          <TravelText travel={travel} />
          {place.dur > 0 && <span>· {t("unit.stayMin", { n: place.dur })}</span>}
        </span>
        <span className="mt-1.5 flex items-center gap-1.5">
          <Badge variant={fits ? "success" : "danger"}>{fits ? t("course.places.fits") : t("course.places.tight")}</Badge>
          {place.price > 0 && <span className="text-micro text-sub">{formatKrw(place.price)}~</span>}
        </span>
      </button>
      <button
        type="button"
        onClick={onToggle}
        disabled={locked}
        aria-pressed={on}
        aria-label={`${on ? t("common.remove") : t("course.places.add")} · ${name}`}
        className={cn("flex size-[34px] shrink-0 cursor-pointer items-center justify-center rounded-full text-lg font-extrabold disabled:cursor-not-allowed disabled:opacity-50", on ? "bg-blue text-white" : "bg-tint text-blue-deep")}
      >
        {on ? <Check size={18} aria-hidden /> : "+"}
      </button>
    </Card>
  );
}

function PlaceDetail({ place, travel, on, fits, locked, onToggle }: { place: CoursePlace; travel: TravelResult; on: boolean; fits: boolean; locked: boolean; onToggle: () => void }) {
  const { t, i18n } = useTranslation();
  return (
    <div className="flex flex-col gap-2.5">
      <span className="flex flex-wrap items-center gap-1.5">
        <CategoryTag cat={place.cat} />
        {AD_PLACE_IDS.has(place.id) && <Badge variant="ad">{t("common.badge.partnerAd")}</Badge>}
      </span>
      <p className="text-body text-sub">{localize(place.area, i18n.language)}</p>
      <p className="flex flex-wrap items-center gap-1.5 text-body font-bold text-blue-deep">
        <TravelText travel={travel} />
        {place.dur > 0 && <span>· {t("unit.stayMin", { n: place.dur })}</span>}
        {place.price > 0 && <span>· {formatKrw(place.price)}~</span>}
      </p>
      <Badge variant={fits ? "success" : "danger"} className="self-start">
        {fits ? t("course.places.fits") : t("course.places.tight")}
      </Badge>
      <Button variant={on ? "outline" : "primary"} size="md" className="mt-1.5 w-full" disabled={locked} onClick={onToggle}>
        {on ? t("common.remove") : t("course.places.add")}
      </Button>
    </div>
  );
}
