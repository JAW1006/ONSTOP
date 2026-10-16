// 예약 요청 저장소 — 지금은 데모용 메모리 저장(새로 고침하면 사라짐, 호텔에 전송 안 됨).
// 서버(POST/GET /api/booking-requests)가 생기면 같은 인터페이스로 교체한다 — docs/design/screens/booking.md "요청 레코드".
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type RequestStatus = "requested" | "confirmed" | "declined" | "expired" | "cancelled";
export type RequestMode = "product" | "quote";

export interface BookingRequest {
  id: string;
  roomId: string;
  mode: RequestMode;
  /** 체크인 슬롯(도착일 0시 기준 분) */
  checkInMin: number;
  /** 이용 종료 — 상품 요청은 슬롯 + 상품 시간, 견적 요청은 숙소 출발 기한 */
  endMin: number;
  hours?: number;
  price?: number;
  priceSource?: "hotel" | "demo";
  planIds: string[];
  name: string;
  email: string;
  lang: string;
  status: RequestStatus;
  declineReason?: string;
  createdAt: number;
}

export type NewBookingRequest = Omit<BookingRequest, "id" | "status" | "createdAt">;

export interface BookingRequestStore {
  /** 최신이 앞 */
  requests: BookingRequest[];
  create: (input: NewBookingRequest) => BookingRequest;
  /** 요청됨만 취소할 수 있다(B8) */
  cancel: (id: string) => void;
}

/** 진행 중(요청됨·확정) — 동시에 1건만(B8) */
export const isActive = (r: BookingRequest) => r.status === "requested" || r.status === "confirmed";
export const activeRequest = (requests: readonly BookingRequest[]) => requests.find(isActive) ?? null;

const BookingRequestsContext = createContext<BookingRequestStore | null>(null);

const demoId = () => `DEMO-${String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0")}`;

export function BookingRequestsProvider({ children, initial = [] }: { children: ReactNode; initial?: BookingRequest[] }) {
  const [requests, setRequests] = useState<BookingRequest[]>(initial);
  const store = useMemo<BookingRequestStore>(
    () => ({
      requests,
      create: (input) => {
        const req: BookingRequest = { ...input, id: demoId(), status: "requested", createdAt: Date.now() };
        setRequests((prev) => [req, ...prev]);
        return req;
      },
      cancel: (id) => setRequests((prev) => prev.map((r) => (r.id === id && r.status === "requested" ? { ...r, status: "cancelled" } : r))),
    }),
    [requests],
  );
  return <BookingRequestsContext.Provider value={store}>{children}</BookingRequestsContext.Provider>;
}

export function useBookingRequests(): BookingRequestStore {
  const ctx = useContext(BookingRequestsContext);
  if (!ctx) throw new Error("useBookingRequests must be used inside BookingRequestsProvider");
  return ctx;
}

/** 이 숙소에 진행 중인 요청의 슬롯·이용 종료 — 코스 제약(B1)용 */
export function useActiveBlock(roomId: string | null): { checkInMin: number; endMin: number } | null {
  const { requests } = useBookingRequests();
  const r = activeRequest(requests);
  return r && roomId && r.roomId === roomId ? { checkInMin: r.checkInMin, endMin: r.endMin } : null;
}
