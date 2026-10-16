// 인천공항 프록시(server/) 호출. 응답 필드는 docs/api/incheon-flights.md(미검증) 참고.
import { averageSecurityWaitMin, effectiveArrival, effectiveDeparture, type FlightTimes } from "@/domain/time-safe";

export interface FlightInfo extends FlightTimes {
  flightId: string;
  airline: string;
  fromAirport?: string;
  toAirport?: string;
  gate?: string | null;
  terminal?: string | null;
  remark?: string | null;
}

export type FlightLookupErrorCode = "notFound" | "noArrivalTime" | "noDepartureTime" | "server";

export class FlightLookupError extends Error {
  constructor(
    public code: FlightLookupErrorCode,
    message: string,
  ) {
    super(message);
  }
}

async function fetchFlight(kind: "arrival" | "departure", flightId: string, apiLang: string): Promise<FlightInfo> {
  const res = await fetch(`/api/flight/${kind}?flightId=${encodeURIComponent(flightId)}&lang=${apiLang}`);
  const data = (await res.json().catch(() => ({}))) as { flights?: FlightInfo[]; error?: string };
  // 레거시는 404를 서버 영문 메시지 그대로 보여줬다 — 새 화면은 "일치하는 항공편 없음"으로 번역(time-safe 명세)
  if (res.status === 404) throw new FlightLookupError("notFound", data.error ?? "not found");
  if (!res.ok) throw new FlightLookupError("server", data.error ?? `HTTP ${res.status}`);
  const flight = data.flights?.[0];
  if (!flight) throw new FlightLookupError("notFound", "no flights");
  return flight;
}

export async function fetchArrival(flightId: string, apiLang: string): Promise<FlightInfo> {
  const flight = await fetchFlight("arrival", flightId, apiLang);
  if (!effectiveArrival(flight)) throw new FlightLookupError("noArrivalTime", "no arrival time");
  return flight;
}

export async function fetchDeparture(flightId: string, apiLang: string): Promise<FlightInfo> {
  const flight = await fetchFlight("departure", flightId, apiLang);
  if (!effectiveDeparture(flight)) throw new FlightLookupError("noDepartureTime", "no departure time");
  return flight;
}

/** T1 출국장 전체 게이트 평균 대기(분). 실패·데이터 없음이면 null(→ 기준값 사용) */
export async function fetchSecurityWaitMin(): Promise<number | null> {
  try {
    const res = await fetch("/api/security-wait");
    if (!res.ok) return null;
    const data = (await res.json()) as { gates?: { waitTimeMin: number }[] };
    return averageSecurityWaitMin(data.gates ?? []);
  } catch {
    return null;
  }
}
