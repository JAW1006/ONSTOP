import logoMark from "@/assets/logo-mark.png";

/** 로고 마크 + "Time"(흰색/잉크) "Stay"(골드) 워드마크. height는 마크 높이(px) */
export function BrandLogo({ height = 30, onDark = true }: { height?: number; onDark?: boolean }) {
  return (
    <div className="inline-flex items-center" style={{ gap: Math.round(height * 0.34) }}>
      <img src={logoMark} alt="" className="block w-auto" style={{ height }} />
      <span className="leading-none font-extrabold tracking-[-0.4px]" style={{ fontSize: Math.round(height * 0.66) }}>
        <span className={onDark ? "text-white" : "text-ink"}>Time</span>
        <span className="text-gold">Stay</span>
      </span>
    </div>
  );
}
