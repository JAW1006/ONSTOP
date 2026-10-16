import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * 여행(환승) 단위 앱 상태 — 레거시 App의 cats/flight/connFlight와 온보딩 통과 여부.
 * 서버 데이터(항공편 조회 결과)는 TanStack Query가 갖고, 여기는 사용자 입력과 "무엇을 조회했는지"만 둔다.
 */
export interface TripState {
  interests: string[];
  toggleInterest: (key: string) => void;
  /** 입력창 값 */
  arrivalInput: string;
  setArrivalInput: (v: string) => void;
  departureInput: string;
  setDepartureInput: (v: string) => void;
  /** 조회를 요청한 편명(쿼리 키). 조회 버튼을 눌러야 바뀐다 */
  arrivalFlightId: string | null;
  setArrivalFlightId: (v: string | null) => void;
  departureFlightId: string | null;
  setDepartureFlightId: (v: string | null) => void;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
}

const TripContext = createContext<TripState | null>(null);

/** 레거시 기본 관심사 */
export const DEFAULT_INTERESTS = ["Shopping", "Rest"];

type TripInitial = Partial<Pick<TripState, "onboarded" | "interests" | "arrivalFlightId" | "departureFlightId">>;

export function TripProvider({ children, initial }: { children: ReactNode; initial?: TripInitial }) {
  const [interests, setInterests] = useState<string[]>(initial?.interests ?? DEFAULT_INTERESTS);
  const [arrivalInput, setArrivalInput] = useState(initial?.arrivalFlightId ?? "");
  const [departureInput, setDepartureInput] = useState(initial?.departureFlightId ?? "");
  const [arrivalFlightId, setArrivalFlightId] = useState<string | null>(initial?.arrivalFlightId ?? null);
  const [departureFlightId, setDepartureFlightId] = useState<string | null>(initial?.departureFlightId ?? null);
  const [onboarded, setOnboarded] = useState(initial?.onboarded ?? false);

  const value = useMemo<TripState>(
    () => ({
      interests,
      toggleInterest: (key) => setInterests((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])),
      arrivalInput,
      setArrivalInput,
      departureInput,
      setDepartureInput,
      arrivalFlightId,
      setArrivalFlightId,
      departureFlightId,
      setDepartureFlightId,
      onboarded,
      setOnboarded,
    }),
    [interests, arrivalInput, departureInput, arrivalFlightId, departureFlightId, onboarded],
  );
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip(): TripState {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrip must be used inside TripProvider");
  return ctx;
}
