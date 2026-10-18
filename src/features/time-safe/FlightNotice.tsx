import { Bell, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTrip } from "@/app/trip-state";
import { useTimeFormat, useTimeSafe } from "./hooks";

type Notice = { key: "flight.notice.arrivalChanged" | "flight.notice.returnByChanged"; from: number; to: number };

/**
 * 재조회로 도착 시각이나 복귀 추천 시각이 바뀌면 배너용 알림을 만든다.
 * - 같은 편명끼리만 비교(편명을 바꿔 새로 조회한 경우는 알리지 않는다)
 * - 복귀 추천 시각 변경이 도착 시각 변경보다 우선(레거시 동일)
 */
export function useFlightChangeNotice() {
  const { arrivalFlightId, departureFlightId } = useTrip();
  const { connection, result, bothReady } = useTimeSafe();
  const [notice, setNotice] = useState<Notice | null>(null);
  const prev = useRef<{ ids: string; arrive: number; returnBy: number } | null>(null);
  const arrive = connection?.arriveMin;
  const returnBy = result.returnByMin;

  useEffect(() => {
    if (!bothReady || arrive == null) return;
    const cur = { ids: `${arrivalFlightId}|${departureFlightId}`, arrive, returnBy };
    const before = prev.current;
    prev.current = cur;
    if (!before || before.ids !== cur.ids) return;
    if (cur.returnBy !== before.returnBy)
      setNotice({ key: "flight.notice.returnByChanged", from: before.returnBy, to: cur.returnBy });
    else if (cur.arrive !== before.arrive)
      setNotice({ key: "flight.notice.arrivalChanged", from: before.arrive, to: cur.arrive });
  }, [bothReady, arrive, returnBy, arrivalFlightId, departureFlightId]);

  return { notice, dismiss: () => setNotice(null) };
}

/** 탭 화면 상단 항공편 변경 배너(레거시 FlightNotice) */
export function FlightNotice() {
  const { t } = useTranslation();
  const fmt = useTimeFormat();
  const { notice, dismiss } = useFlightChangeNotice();
  if (!notice) return null;
  return (
    <div
      role="status"
      className="absolute inset-x-2.5 top-2.5 z-40 flex items-center gap-2 rounded-md bg-ink px-3 py-2.5 text-white shadow-(--ts-shadow-toast)"
    >
      <Bell size={14} className="shrink-0 text-gold" aria-hidden />
      <span className="flex-1 text-caption leading-snug">
        {t(notice.key, { old: fmt.time(notice.from), new: fmt.time(notice.to) })}
      </span>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("common.dismiss")}
        className="shrink-0 cursor-pointer p-0.5 text-on-dark-muted"
      >
        <X size={15} aria-hidden />
      </button>
    </div>
  );
}
