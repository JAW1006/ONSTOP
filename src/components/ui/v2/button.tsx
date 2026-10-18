import type { ReactNode } from "react";

/**
 * design/reference/src/App.tsx (Button, lines 63-81) 그대로 이식.
 * variant는 reference처럼 className으로 합성한다(cva 같은 variant prop 시스템 없음).
 * 터치 영역 44x44는 design-tokens.md 2절("터치 영역 최소 44x44px").
 */
export function Button({
  children,
  className = "",
  disabled,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      className={`inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 border-0 bg-none p-0 disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}
