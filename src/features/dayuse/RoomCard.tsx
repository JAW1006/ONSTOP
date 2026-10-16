import { Bed, Droplets, Luggage } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Photo } from "@/components/ui/photo";
import { localize, roomImage, type Room } from "@/data";
import { formatKrw } from "@/lib/format";

/** 홈 데이유즈 가로 목록의 숙소 카드(레거시 HomeScreen ROOMS.map) */
export function RoomCard({ room }: { room: Room }) {
  const { t, i18n } = useTranslation();
  return (
    <Link to={`/booking/${room.id}`} className="block min-w-[178px] shrink-0">
      <Photo
        src={roomImage(room)}
        icon={<Bed size={30} color="#fff" />}
        tint={room.tint}
        badge={room.best ? t("common.badge.topPick") : undefined}
      />
      <p className="mt-2 text-emph font-extrabold text-ink">{localize(room.name, i18n.language)}</p>
      <p className="mt-0.5 text-caption text-faint">
        {t("unit.minFromAirport", { n: room.distMin })} · {t("unit.hourRange", { a: room.hourMin, b: room.hourMax })}
      </p>
      <p className="mt-1.5 flex gap-2 text-micro text-sub">
        <span className="flex items-center gap-0.5">
          <Droplets size={11} aria-hidden /> {t("dayuse.feature.shower")}
        </span>
        <span className="flex items-center gap-0.5">
          <Bed size={11} aria-hidden /> {t("dayuse.feature.rest")}
        </span>
        <span className="flex items-center gap-0.5">
          <Luggage size={11} aria-hidden /> {t("dayuse.feature.luggage")}
        </span>
      </p>
      <p className="mt-1.5 flex items-baseline gap-1">
        <span className="text-emph font-extrabold text-ink">{formatKrw(room.price)}~</span>
        <span className="text-[9px] text-faint">{t("dayuse.perBlock")}</span>
      </p>
    </Link>
  );
}
