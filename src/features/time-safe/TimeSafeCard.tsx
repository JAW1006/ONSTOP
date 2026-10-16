import { Clock, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTimeFormat, useTimeSafe } from "./hooks";

/** 온보딩 step 2의 Time-Safe 결과 카드(어두운 배경) — docs/design/screens/time-safe.md */
export function TimeSafeCard() {
  const { t } = useTranslation();
  const fmt = useTimeFormat();
  const { arrival, departure, connection, result, bothReady } = useTimeSafe();
  const a = arrival.data;
  const d = departure.data;

  return (
    <section aria-label={t("timeSafe.heading")} className="mt-3.5 rounded-xl bg-ink px-[18px] py-4 text-white">
      <div className="flex items-center justify-between text-body text-on-dark-sub">
        <span className="flex items-center gap-2">
          <ShieldCheck size={15} aria-hidden /> {t("timeSafe.heading")}
        </span>
        {bothReady && <span className="text-micro font-bold text-lime">{t("timeSafe.liveDepartureApplied")}</span>}
      </div>

      {!a && <p className="mt-2.5 text-body leading-relaxed text-on-dark-muted">{t("timeSafe.needArrival")}</p>}

      {a && connection && (
        <p className="mt-2.5 text-caption text-on-dark-muted">
          {a.airline} {a.flightId} · {t("flight.from")} {a.fromAirport} · {t("timeSafe.arrive")} {fmt.time(connection.arriveMin)} ·{" "}
          {t("flight.terminal")} {a.terminal || "-"} · {t("flight.gate")} {a.gate || "-"} · {t("flight.status")}{" "}
          {a.remark || t("flight.onTime")}
        </p>
      )}

      {a && !bothReady && <p className="mt-2.5 text-body leading-relaxed text-on-dark-muted">{t("timeSafe.needConnection")}</p>}

      {bothReady && d && connection?.departMin != null && (
        <>
          <p className="mt-1.5 text-caption text-on-dark-muted">
            {d.airline} {d.flightId} · {t("flight.to")} {d.toAirport} · {t("flight.departs")} {fmt.time(connection.departMin)}
          </p>
          {connection.warning === "DEPART_BEFORE_ARRIVAL" ? (
            <p role="alert" className="mt-2 text-caption font-bold text-on-dark-danger">
              {t("timeSafe.warning.departBeforeArrival")}
            </p>
          ) : (
            <p className="mt-2 text-body font-bold text-white">
              {t("timeSafe.totalConnection", { dur: fmt.duration(result.totalConnectionMin ?? 0) })}
            </p>
          )}
          {connection.warning === "OVER_24H" && (
            <p role="alert" className="mt-1 text-caption font-bold text-on-dark-danger">
              {t("timeSafe.warning.over24h")}
            </p>
          )}

          {result.canGoOut ? (
            <>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-display-lg font-black text-gold">{fmt.duration(result.outingMin)}</span>
                <span className="text-body text-on-dark">{t("timeSafe.outingAvailable")}</span>
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-body text-on-dark">
                <Clock size={13} aria-hidden /> {t("timeSafe.arrive")} {fmt.time(connection.arriveMin)} ·{" "}
                <b className="text-white">
                  {t("timeSafe.returnBy")} {fmt.time(result.returnByMin)}
                </b>
              </p>
            </>
          ) : (
            <div role="alert" className="mt-2.5 rounded-md border border-red bg-on-dark-danger-bg px-3 py-2.5">
              <p className="text-body font-extrabold text-on-dark-danger">{t("timeSafe.cannotGoOut.title")}</p>
              <p className="mt-1 text-caption leading-normal text-on-dark-danger-sub">{t("timeSafe.cannotGoOut.description")}</p>
            </div>
          )}
          <p className="mt-2 text-micro text-on-dark-muted">
            {t("timeSafe.bufferBreakdown", {
              immigration: result.arrivalImmigrationMin,
              security: result.securityMin,
              gate: result.gateMarginMin,
            })}
          </p>
        </>
      )}
    </section>
  );
}
