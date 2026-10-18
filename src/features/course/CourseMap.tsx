import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppMode } from "@/app/app-mode";
import { AIRPORT_COORD, localize, ROOMS, type CoursePlace } from "@/data";
import { listedRooms } from "@/data/partners";
import { KakaoMapView } from "./KakaoMapView";
import type { RefPoi } from "./api";
import { MODE_EMOJI } from "./map-style";
import { useMapView, type MapLeg, type MapScene } from "./map-view";
import type { RouteLeg } from "./route";

/** 코스 → 지도 장면(핀·구간 칩·후보 점). 색·선 규칙은 design-tokens.md "색 역할 규칙"/"선 스타일 규칙" */
export function CourseMap({
  roomId,
  plan,
  legs,
  candidates = [],
  refPois = [],
  showOtherHotels = true,
  selectedLeg,
  onSelectLeg,
  onSelectRoom,
  onPlaceClick,
}: {
  roomId: string | null;
  plan: readonly CoursePlace[];
  legs: readonly RouteLeg[];
  candidates?: readonly CoursePlace[];
  refPois?: readonly RefPoi[];
  showOtherHotels?: boolean;
  selectedLeg: number | null;
  onSelectLeg: (index: number | null) => void;
  onSelectRoom?: (id: string) => void;
  onPlaceClick?: (place: CoursePlace) => void;
}) {
  const { t, i18n } = useTranslation();
  const MapView = useMapView(KakaoMapView);
  const { demo } = useAppMode();
  const room = ROOMS.find((r) => r.id === roomId) ?? null;

  const scene = useMemo<MapScene>(() => {
    const lang = i18n.language;
    const legLabel = (leg: RouteLeg) => {
      const time = leg.approx ? t("course.leg.approxMinutes", { n: leg.min }) : t("course.leg.minutes", { n: leg.min });
      const mode = t(
        leg.mode === "transit"
          ? "course.leg.mode.transit"
          : leg.mode === "walk"
            ? "course.leg.mode.walk"
            : "course.leg.mode.taxi",
      );
      return { time, mode };
    };
    const mapLegs: MapLeg[] = legs.map((leg, index) => {
      const { time, mode } = legLabel(leg);
      // 거리는 실제 값이 있을 때만(근사·도보는 시간만 — 2026-10-16 결정 5)
      const sub = leg.distanceM != null ? t("course.leg.km", { km: (leg.distanceM / 1000).toFixed(1) }) : null;
      const tag = leg.isReturn ? t("course.leg.return") : leg.isHotelReturn ? t("course.leg.hotelReturn") : null;
      const text = tag ? `${tag} ${time}` : time;
      return {
        index,
        from: leg.from,
        to: leg.to,
        path: leg.path,
        mode: leg.mode,
        isReturn: leg.isReturn,
        chip: {
          icon: MODE_EMOJI[leg.mode],
          text,
          sub,
          ariaLabel: `${tag ? tag + " · " : ""}${mode} ${time}${sub ? ` · ${sub}` : ""}`,
        },
      };
    });
    const planIds = new Set(plan.map((p) => p.id));
    return {
      center: room?.coord ?? AIRPORT_COORD,
      pins: [
        { id: "airport", kind: "airport", coord: AIRPORT_COORD, label: "ICN" },
        ...listedRooms(demo)
          .filter((r) => r.id === roomId || showOtherHotels)
          .map((r) => ({
            id: `room:${r.id}`,
            kind: r.id === roomId ? ("hotel" as const) : ("hotel-other" as const),
            coord: r.coord,
            label: localize(r.name, lang),
          })),
        ...plan.map((p, i) => ({
          id: `place:${p.id}`,
          kind: "place" as const,
          coord: p.coord,
          label: localize(p.name, lang),
          number: i + 1,
        })),
      ],
      dots: [
        ...candidates
          .filter((p) => !planIds.has(p.id))
          .map((p) => ({
            id: `place:${p.id}`,
            kind: "candidate" as const,
            coord: p.coord,
            name: localize(p.name, lang),
          })),
        ...refPois.map((p) => ({
          id: `ref:${p.id}`,
          kind: "ref" as const,
          coord: p.coord,
          name: `${p.name} · ${t("course.map.referenceOnly")}`,
        })),
      ],
      legs: mapLegs,
      selectedLeg,
    };
  }, [i18n.language, t, legs, plan, room, roomId, candidates, refPois, showOtherHotels, selectedLeg]);

  const byId = (id: string) => [...plan, ...candidates].find((p) => `place:${p.id}` === id);
  return (
    <MapView
      scene={scene}
      unavailableText={t("course.map.unavailable")}
      onPinClick={(id) => {
        if (id.startsWith("room:")) onSelectRoom?.(id.slice(5));
        const p = byId(id);
        if (p) onPlaceClick?.(p);
      }}
      onDotClick={(id) => {
        const p = byId(id);
        if (p) onPlaceClick?.(p);
      }}
      onLegClick={(index) => onSelectLeg(selectedLeg === index ? null : index)}
    />
  );
}
