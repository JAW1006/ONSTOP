import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** 토글 칩(카테고리 선택 등). 선택 상태는 aria-pressed로도 노출한다. */
export function Chip({ active = false, className, type = "button", ...props }: ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        "cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-body font-semibold",
        active ? "bg-blue text-primary-foreground" : "bg-tint text-blue-deep",
        className,
      )}
      {...props}
    />
  );
}
