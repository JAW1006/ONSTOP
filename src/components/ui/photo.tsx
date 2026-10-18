import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";

/** 사진이 있으면 꽉 채우고, 없으면 틴트 배경 + 아이콘. 좌상단 배지 선택. */
export function Photo({
  src,
  icon,
  tint,
  height = 96,
  badge,
  className,
}: {
  src?: string;
  icon?: ReactNode;
  /** 데이터(ROOMS/PLACES)의 tint 색 — 장소별 값이라 토큰이 아니다 */
  tint?: string;
  height?: number;
  badge?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden rounded-md", className)}
      style={{ height, background: tint }}
    >
      {badge && (
        <Badge variant="solid" className="absolute top-2 left-2">
          {badge}
        </Badge>
      )}
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <div className="opacity-55" aria-hidden>
          {icon}
        </div>
      )}
    </div>
  );
}
