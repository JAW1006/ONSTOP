import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 좌 라벨 / 우 값 한 줄(레거시 Info·Line). size="md"는 결제 내역, "sm"은 예약 확인 정보 */
export function KeyValueRow({
  label,
  value,
  size = "sm",
  tone = "default",
}: {
  label: ReactNode;
  value: ReactNode;
  size?: "sm" | "md";
  tone?: "default" | "success";
}) {
  return (
    <div className={cn("flex justify-between gap-3", size === "md" && "py-1")}>
      <span className={cn(size === "md" ? "text-body text-sub" : "text-body text-faint")}>{label}</span>
      <span className={cn("text-right text-body", size === "md" ? "font-semibold" : "font-bold", tone === "success" ? "text-success" : "text-ink")}>
        {value}
      </span>
    </div>
  );
}
