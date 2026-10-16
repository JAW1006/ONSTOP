import { ChevronLeft, RefreshCw, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useTrip } from "@/app/trip-state";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DEFAULT_ARRIVE } from "@/domain/constants";
import { flightDelayMin } from "@/domain/time-safe";
import { cn } from "@/lib/utils";
import type { FlightInfo } from "./api";
import { useTimeFormat, useTimeSafe } from "./hooks";

/** 홈의 Time-Safe 요약 카드 — docs/design/screens/home.md */
export function TimeSafeSummaryCard() {
  const { t } = useTranslation();
  const fmt = useTimeFormat();
  const { arrivalFlightId } = useTrip();
  const { arrival, departure, connection, result, refetchAll, isRefetching, liveSecurityApplied } = useTimeSafe();
  const live = !!arrival.data;
  const arriveMin = connection?.arriveMin ?? DEFAULT_ARRIVE;

  return (
    <Card className="mb-4 border-l-4 border-blue p-[15px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Link to="/onboarding?step=2" aria-label={t("flight.change")} className="-mr-0.5 flex text-sub">
            <ChevronLeft size={17} aria-hidden />
          </Link>
          <ShieldCheck size={17} className="text-blue" aria-hidden />
          <h2 className="text-emph font-extrabold text-ink">Time-Safe · {arrivalFlightId}</h2>
        </div>
        <div className="flex items-center gap-1.5">
          {live && (
            <button
              type="button"
              onClick={() => void refetchAll()}
              disabled={isRefetching}
              aria-label={t("flight.refresh")}
              className="flex cursor-pointer p-0.5 text-sub disabled:cursor-default"
            >
              <RefreshCw size={14} className={cn(isRefetching && "animate-spin")} aria-hidden />
            </button>
          )}
          <Badge variant={live ? "success" : "neutral"} className="px-2.5 py-[3px] text-caption">
            {live ? t("common.badge.live") : t("common.badge.demo")}
          </Badge>
        </div>
      </div>

      {arrival.data && connection && (
        <FlightStatusLine flight={arrival.data} min={connection.arriveMin} label="flight.arrivalLine" className="mt-2.5" />
      )}
      {departure.data && connection?.departMin != null && (
        <FlightStatusLine flight={departure.data} min={connection.departMin} label="flight.departureLine" className="mt-1" />
      )}
      {connection?.departMin != null && connection.warning !== "DEPART_BEFORE_ARRIVAL" && (
        <p className="mt-1.5 text-caption font-bold text-ink">
          {t("timeSafe.totalConnection", { dur: fmt.duration(result.totalConnectionMin ?? 0) })}
        </p>
      )}
      {connection?.warning && (
        <p role="alert" className="mt-1 text-caption font-bold text-red">
          {t(connection.warning === "OVER_24H" ? "timeSafe.warning.over24h" : "timeSafe.warning.departBeforeArrival")}
        </p>
      )}

      {result.canGoOut ? (
        <>
          <div className="mt-2.5 flex items-end gap-3.5">
            <div>
              <p className="text-display font-black text-blue-deep">{fmt.duration(result.outingMin)}</p>
              <p className="text-micro text-faint">{t("timeSafe.outingAvailableShort")}</p>
            </div>
            <p className="flex-1 text-body leading-normal text-sub">
              {t("timeSafe.arrive")} <b className="text-ink">{fmt.time(arriveMin)}</b>
              <br />
              {t("timeSafe.returnRecommended")} <b className="text-red">{fmt.time(result.returnByMin)}</b>
            </p>
          </div>
          {connection?.departMin != null && (
            <p className="mt-2 text-micro text-faint">
              {t("timeSafe.bufferBreakdown", {
                immigration: result.arrivalImmigrationMin,
                security: result.securityMin,
                gate: result.gateMarginMin,
              })}
              {liveSecurityApplied && <span className="ml-1 font-bold text-blue">· {t("timeSafe.liveSecurityWait")}</span>}
            </p>
          )}
        </>
      ) : (
        <div role="alert" className="mt-2.5 rounded-md border border-red bg-danger-bg px-3 py-2.5">
          <p className="text-body font-extrabold text-red">{t("timeSafe.cannotGoOut.title")}</p>
          <p className="mt-1 text-caption leading-normal text-sub">{t("timeSafe.cannotGoOut.description")}</p>
        </div>
      )}
    </Card>
  );
}

/** 항공사·편명·시각 한 줄 + 지연 배지(레거시 FlightStatusLine) */
function FlightStatusLine({
  flight,
  min,
  label,
  className,
}: {
  flight: FlightInfo;
  min: number;
  label: "flight.arrivalLine" | "flight.departureLine";
  className?: string;
}) {
  const { t } = useTranslation();
  const fmt = useTimeFormat();
  const delay = flightDelayMin(flight);
  return (
    <p className={cn("flex flex-wrap items-center gap-1.5 text-micro text-faint", className)}>
      <span>{t(label, { airline: flight.airline, flightId: flight.flightId, time: fmt.time(min) })}</span>
      {delay > 0 && <span className="font-bold text-red">{t("flight.delayed", { n: delay })}</span>}
    </p>
  );
}
