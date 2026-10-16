// 선 스타일 규칙 — 값의 원본은 tokens.css(--ts-line-*, --ts-role-*), 문서는 design-tokens.md "선 스타일 규칙".
// 카카오맵 Polyline은 CSS를 못 읽으므로 런타임에 토큰을 읽어 넘긴다. strokeStyle 문자열만 여기에 둔다.
import type { TravelMode } from "@/domain/travel";

export type LineKind = "transit" | "taxi" | "walk" | "return";

export const lineKind = (mode: TravelMode, isReturn: boolean): LineKind =>
  isReturn ? "return" : mode === "transit" ? "transit" : mode === "walk" ? "walk" : "taxi";

/** 카카오 strokeStyle — 도보는 작은 점, 복귀는 긴 파선(크기·간격이 확실히 다르게) */
export const KAKAO_STROKE_STYLE: Record<LineKind, string> = {
  transit: "solid",
  taxi: "solid",
  walk: "shortdot",
  return: "longdash",
};

const WIDTH_TOKEN: Record<LineKind, string> = {
  transit: "--ts-line-transit-width",
  taxi: "--ts-line-taxi-width",
  walk: "--ts-line-walk-width",
  return: "--ts-line-return-width",
};
const FALLBACK = {
  "--ts-line-transit-width": "6px",
  "--ts-line-taxi-width": "4px",
  "--ts-line-walk-width": "3px",
  "--ts-line-return-width": "4px",
  "--ts-line-selected-boost": "2px",
  "--ts-line-dimmed-opacity": "0.3",
  "--ts-line-opacity": "0.9",
  "--ts-role-route": "#0e8c84",
  "--ts-role-return": "#e23b3b",
} as const;

function token(name: keyof typeof FALLBACK): string {
  if (typeof document === "undefined") return FALLBACK[name];
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || FALLBACK[name];
}

/** 구간 하나의 카카오 Polyline 옵션(선택 구간은 굵고 진하게, 나머지는 옅게) */
export function polylineStyle(kind: LineKind, selection: "none" | "selected" | "dimmed") {
  const width = parseFloat(token(WIDTH_TOKEN[kind] as keyof typeof FALLBACK));
  const boost = selection === "selected" ? parseFloat(token("--ts-line-selected-boost")) : 0;
  const opacity = selection === "dimmed" ? parseFloat(token("--ts-line-dimmed-opacity")) : selection === "selected" ? 1 : parseFloat(token("--ts-line-opacity"));
  return {
    strokeWeight: width + boost,
    strokeColor: token(kind === "return" ? "--ts-role-return" : "--ts-role-route"),
    strokeOpacity: opacity,
    strokeStyle: KAKAO_STROKE_STYLE[kind],
  };
}

/** 칩 아이콘(글자와 함께 표시 — 색만으로 의미 전달 금지) */
export const MODE_EMOJI: Record<TravelMode, string> = { transit: "🚇", drive: "🚕", walk: "🚶" };
