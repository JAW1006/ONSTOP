import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { CoursePlace } from "@/data";

/** 저장된 코스(레거시 savedCourse) */
export interface SavedCourse {
  roomId: string;
  plan: CoursePlace[];
  cats: string[];
}

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
  /** 코스 빌더 — 거점 숙소·담은 장소(순서 = 방문 순서)·선택 카테고리 */
  courseRoomId: string | null;
  setCourseRoomId: (id: string | null) => void;
  coursePlan: CoursePlace[];
  setCoursePlan: (plan: CoursePlace[] | ((prev: CoursePlace[]) => CoursePlace[])) => void;
  courseCats: string[] | null;
  setCourseCats: (cats: string[] | ((prev: string[]) => string[])) => void;
  savedCourse: SavedCourse | null;
  setSavedCourse: (c: SavedCourse | null) => void;
}

const TripContext = createContext<TripState | null>(null);

/** 레거시 기본 관심사 */
export const DEFAULT_INTERESTS = ["Shopping", "Rest"];

type TripInitial = Partial<
  Pick<TripState, "onboarded" | "interests" | "arrivalFlightId" | "departureFlightId" | "courseRoomId" | "coursePlan" | "savedCourse">
>;

export function TripProvider({ children, initial }: { children: ReactNode; initial?: TripInitial }) {
  const [interests, setInterests] = useState<string[]>(initial?.interests ?? DEFAULT_INTERESTS);
  const [arrivalInput, setArrivalInput] = useState(initial?.arrivalFlightId ?? "");
  const [departureInput, setDepartureInput] = useState(initial?.departureFlightId ?? "");
  const [arrivalFlightId, setArrivalFlightId] = useState<string | null>(initial?.arrivalFlightId ?? null);
  const [departureFlightId, setDepartureFlightId] = useState<string | null>(initial?.departureFlightId ?? null);
  const [onboarded, setOnboarded] = useState(initial?.onboarded ?? false);
  const [courseRoomId, setCourseRoomId] = useState<string | null>(initial?.courseRoomId ?? null);
  const [coursePlan, setCoursePlan] = useState<CoursePlace[]>(initial?.coursePlan ?? []);
  // null = 아직 안 고름 → 화면에서 관심사(휴식 제외)로 초기화(레거시 initSel)
  const [courseCatsState, setCourseCatsState] = useState<string[] | null>(null);
  const [savedCourse, setSavedCourse] = useState<SavedCourse | null>(initial?.savedCourse ?? null);

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
      courseRoomId,
      setCourseRoomId,
      coursePlan,
      setCoursePlan,
      courseCats: courseCatsState,
      setCourseCats: (cats) => setCourseCatsState((prev) => (typeof cats === "function" ? cats(prev ?? []) : cats)),
      savedCourse,
      setSavedCourse,
    }),
    [interests, arrivalInput, departureInput, arrivalFlightId, departureFlightId, onboarded, courseRoomId, coursePlan, courseCatsState, savedCourse],
  );
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip(): TripState {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrip must be used inside TripProvider");
  return ctx;
}
