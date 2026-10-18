import { Brand } from "./brand";
import { Button } from "./button";
import { Icon } from "./icon";

/**
 * design/reference/src/App.tsx (AppHeader, lines 190-199) 그대로 이식.
 * reference의 `flight` 상수(미사용 변수 결함, App.tsx:182)는 복제하지 않는다 —
 * flightLabel을 props로 받아 호출하는 화면이 실제 항공편 문구를 채운다.
 */
export function AppHeader({
  title,
  flightLabel,
  onFlight,
}: {
  title?: string;
  flightLabel?: string;
  onFlight?: () => void;
}) {
  return (
    <div className="relative z-20 flex min-h-16 w-full items-center justify-between gap-3 border-b border-v2-line bg-v2-paper/92 px-5 py-3">
      {title ? <div className="min-w-0 text-[17px] font-bold">{title}</div> : <Brand />}
      {flightLabel && (
        <Button className="flex-none rounded-full bg-v2-pale px-2.75 py-2 text-[11px] font-bold" onClick={onFlight}>
          <Icon name="plane" size={15} /> {flightLabel}
        </Button>
      )}
    </div>
  );
}
