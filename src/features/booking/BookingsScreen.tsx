import { CalendarCheck } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { useAppMode } from "@/app/app-mode";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { KeyValueRow } from "@/components/ui/key-value-row";
import { PageHeader } from "@/components/ui/page-header";
import { AIRPORT_COORD, localize, roomById, type Localized } from "@/data";
import { listedRooms, offerFor, partnerOf } from "@/data/partners";
import { approxResult } from "@/features/course/route";
import { useTimeFormat } from "@/features/time-safe/hooks";
import { formatKrw } from "@/lib/format";
import { DemoBanner } from "./BookingScreen";
import { useBookingRequests, type BookingRequest, type RequestStatus } from "./requests";

const STATUS_BADGE: Record<RequestStatus, "neutral" | "success" | "danger"> = {
  requested: "neutral",
  confirmed: "success",
  declined: "danger",
  expired: "neutral",
  cancelled: "neutral",
};
const ALTERNATIVES = 3;

/** 요청 내역·상태 — docs/design/screens/booking.md "요청 내역·상태" */
export function BookingsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { requests, cancel } = useBookingRequests();
  const [cancelling, setCancelling] = useState<BookingRequest | null>(null);

  return (
    <div>
      <DemoBanner />
      <PageHeader title={t("bookings.title")} onBack={() => navigate("/")} />
      <div className="flex flex-col gap-3.5 p-4">
        {requests.length === 0 ? (
          <div className="py-[60px] text-center">
            <CalendarCheck size={40} className="mx-auto mb-3 text-faint" aria-hidden />
            <p className="text-body text-faint">{t("booking.empty")}</p>
            <Button variant="outline" size="md" className="mt-5" onClick={() => navigate("/")}>
              {t("booking.browseStays")}
            </Button>
          </div>
        ) : (
          requests.map((r) => <RequestCard key={r.id} request={r} onCancel={() => setCancelling(r)} />)
        )}
      </div>
      <BottomSheet open={!!cancelling} onOpenChange={(o) => !o && setCancelling(null)} title={t("bookings.cancelConfirm.title")}>
        <p className="mb-4 text-body text-sub">{t("bookings.cancelConfirm.body")}</p>
        <div className="flex gap-2.5">
          <Button variant="outline" size="md" className="flex-1" onClick={() => setCancelling(null)}>
            {t("common.dismiss")}
          </Button>
          <Button
            size="md"
            className="flex-1"
            onClick={() => {
              if (cancelling) cancel(cancelling.id);
              setCancelling(null);
            }}
          >
            {t("bookings.cancelConfirm.yes")}
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}

function RequestCard({ request: r, onCancel }: { request: BookingRequest; onCancel: () => void }) {
  const { t, i18n } = useTranslation();
  const fmt = useTimeFormat();
  const lang = i18n.language;
  const room = roomById(r.roomId);
  const partner = partnerOf(r.roomId);
  const text = (v: Localized) => localize(v, lang);
  return (
    <Card className="p-4" role="article" aria-label={t("bookings.requestId", { id: r.id })}>
      <div className="flex items-center justify-between gap-2">
        <Badge variant={STATUS_BADGE[r.status]}>{t(`bookings.status.${r.status}`)}</Badge>
        <span className="text-micro text-faint">{t("bookings.requestId", { id: r.id })}</span>
      </div>
      <p className="mt-2 font-extrabold text-ink">{room ? text(room.name) : r.roomId}</p>
      <div className="mt-1.5 flex flex-col gap-0.5">
        <KeyValueRow
          label={t(r.mode === "product" ? "bookings.mode.product" : "bookings.mode.quote")}
          value={
            r.hours != null
              ? t("booking.summary.block", { h: r.hours, from: fmt.time(r.checkInMin), to: fmt.time(r.endMin) })
              : `${fmt.time(r.checkInMin)}–${fmt.time(r.endMin)}`
          }
        />
        {r.price != null ? (
          <KeyValueRow label={t("booking.summary.price")} value={formatKrw(r.price)} />
        ) : (
          <KeyValueRow label={t("booking.summary.price")} value={t("booking.summary.quote")} />
        )}
      </div>

      {r.status === "requested" && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-caption text-sub">{t("bookings.requested.note")}</span>
          <Button variant="outline" size="sm" onClick={onCancel}>
            {t("bookings.cancel")}
          </Button>
        </div>
      )}

      {r.status === "confirmed" && (
        <div className="mt-3 flex flex-col gap-1 rounded-md bg-success-bg px-3 py-2.5">
          <p className="text-body font-bold text-success">{t("bookings.confirmed.note")}</p>
          <p className="text-caption text-ink">{t("bookings.confirmed.cancelHint")}</p>
          <KeyValueRow
            label={t("bookings.contact")}
            value={[partner.contact?.phone, partner.contact?.email].filter(Boolean).join(" · ") || t("bookings.contactPending")}
          />
          <KeyValueRow label={t("bookings.policy")} value={partner.cancellationPolicy ? text(partner.cancellationPolicy) : t("bookings.policyPending")} />
        </div>
      )}

      {(r.status === "declined" || r.status === "expired") && (
        <div className="mt-3">
          <p className="text-body font-bold text-red">{t(r.status === "declined" ? "bookings.declined.note" : "bookings.expired.note")}</p>
          {r.declineReason && <p className="text-caption text-sub">{t("bookings.declined.reason", { reason: r.declineReason })}</p>}
          <Alternatives excludeRoomId={r.roomId} hadCourse={r.planIds.length > 0} />
        </div>
      )}
    </Card>
  );
}

/** 거절·만료 시 대안 숙소 — 노출되는 다른 숙소를 공항에서 가까운(근사) 순으로 최대 3곳 */
function Alternatives({ excludeRoomId, hadCourse }: { excludeRoomId: string; hadCourse: boolean }) {
  const { t, i18n } = useTranslation();
  const { demo } = useAppMode();
  const rooms = listedRooms(demo)
    .filter((r) => r.id !== excludeRoomId)
    .map((r) => ({ room: r, min: approxResult(AIRPORT_COORD, r.coord).min }))
    .sort((a, b) => a.min - b.min)
    .slice(0, ALTERNATIVES);
  if (!rooms.length) return null;
  return (
    <section aria-label={t("bookings.alt.title")} className="mt-2.5">
      <h3 className="mb-1.5 text-caption font-extrabold text-ink">{t("bookings.alt.title")}</h3>
      <ul className="flex flex-col gap-1.5">
        {rooms.map(({ room, min }) => (
          <li key={room.id}>
            <Link to={`/booking/${room.id}`} className="flex items-center justify-between rounded-md bg-tint px-3 py-2">
              <span>
                <span className="block text-caption font-bold text-ink">{localize(room.name, i18n.language)}</span>
                <span className="block text-micro text-faint">{t("booking.fromAirportApprox", { n: min })}</span>
              </span>
              <span className="text-caption font-bold text-blue">{t(offerFor(room.id, demo).offer ? "bookings.alt.price" : "bookings.alt.quote")}</span>
            </Link>
          </li>
        ))}
      </ul>
      {hadCourse && <p className="mt-1.5 text-micro text-faint">{t("bookings.alt.courseHint")}</p>}
    </section>
  );
}
