import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useTrip } from "@/app/trip-state";
import { DEFAULT_ARRIVE, FLIGHT_POLL_INTERVAL_MS, LIVE_SECURITY_TERMINAL } from "@/domain/constants";
import { dayOffset, hhmm } from "@/domain/time";
import { computeTimeSafe, isLiveSecurityApplied, resolveConnection } from "@/domain/time-safe";
import { AIRPORT_API_LANG, DEFAULT_LANGUAGE, LANGUAGE_CODES, type LanguageCode } from "@/i18n/languages";
import { fetchArrival, fetchDeparture, fetchSecurityWaitMin } from "./api";

function useApiLang() {
  const { i18n } = useTranslation();
  const code = (LANGUAGE_CODES as readonly string[]).includes(i18n.language) ? (i18n.language as LanguageCode) : DEFAULT_LANGUAGE;
  return AIRPORT_API_LANG[code];
}

export function useArrivalLookup() {
  const { arrivalFlightId, onboarded } = useTrip();
  const apiLang = useApiLang();
  return useQuery({
    queryKey: ["flight", "arrival", arrivalFlightId, apiLang],
    queryFn: () => fetchArrival(arrivalFlightId!, apiLang),
    enabled: !!arrivalFlightId,
    retry: false,
    // 온보딩 이후 지연·게이트 변경 반영(레거시 2분 폴링)
    refetchInterval: onboarded ? FLIGHT_POLL_INTERVAL_MS : false,
  });
}

export function useDepartureLookup() {
  const { departureFlightId, onboarded } = useTrip();
  const apiLang = useApiLang();
  return useQuery({
    queryKey: ["flight", "departure", departureFlightId, apiLang],
    queryFn: () => fetchDeparture(departureFlightId!, apiLang),
    enabled: !!departureFlightId,
    retry: false,
    refetchInterval: onboarded ? FLIGHT_POLL_INTERVAL_MS : false,
  });
}

/** 연결편이 T1일 때만 출국장 실시간 대기 조회 */
export function useSecurityWait(departureTerminal: string | null) {
  const { onboarded } = useTrip();
  return useQuery({
    queryKey: ["securityWait"],
    queryFn: fetchSecurityWaitMin,
    enabled: departureTerminal === LIVE_SECURITY_TERMINAL,
    retry: false,
    refetchInterval: onboarded ? FLIGHT_POLL_INTERVAL_MS : false,
  });
}

/** 두 항공편 조회 결과 → domain 계산. 도착편이 없으면 데모 도착(10:30) */
export function useTimeSafe() {
  const arrival = useArrivalLookup();
  const departure = useDepartureLookup();
  const connection = arrival.data ? resolveConnection(arrival.data, departure.data ?? null) : null;
  const departureTerminal = departure.data?.terminal ?? null;
  const securityWait = useSecurityWait(departureTerminal);
  const liveSecurityWaitMin = securityWait.data ?? null;

  const result = computeTimeSafe({
    arriveMin: connection?.arriveMin ?? DEFAULT_ARRIVE,
    departMin: connection?.departMin ?? null,
    departureTerminal,
    liveSecurityWaitMin,
  });

  return {
    arrival,
    departure,
    connection,
    result,
    bothReady: !!arrival.data && !!departure.data && connection?.departMin != null,
    liveSecurityApplied: isLiveSecurityApplied(departureTerminal, liveSecurityWaitMin),
  };
}

/** 시각·기간 표시(레거시 fmtTime, stayHours*) */
export function useTimeFormat() {
  const { t } = useTranslation();
  return {
    time: (min: number) => (dayOffset(min) > 0 ? `${t("unit.nextDay")} ${hhmm(min)}` : hhmm(min)),
    duration: (min: number) => {
      const h = Math.floor(min / 60);
      const m = min % 60;
      return m ? t("unit.hoursMinutes", { h, m }) : t("unit.hours", { h });
    },
  };
}
