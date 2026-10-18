/**
 * design/reference/src/App.tsx (Icon, lines 3-61) 그대로 이식. 경로 값은 레퍼런스와 동일하게 둔다.
 */
export type IconName =
  | "arrow"
  | "bag"
  | "bed"
  | "calendar"
  | "car"
  | "check"
  | "chevron"
  | "clock"
  | "close"
  | "home"
  | "language"
  | "map"
  | "plane"
  | "route"
  | "search"
  | "shield"
  | "train"
  | "user"
  | "walk";

const paths: Record<IconName, string[]> = {
  arrow: ["M5 12h14", "m13 6 6 6-6 6"],
  bag: ["M7 8V6a5 5 0 0 1 10 0v2", "M5 8h14v11H5z", "M9 12v3", "M15 12v3"],
  bed: ["M4 18V7", "M4 14h16v4", "M8 14v-4h5a3 3 0 0 1 3 3v1", "M4 19v2", "M20 19v2"],
  calendar: ["M5 5h14v15H5z", "M8 3v4", "M16 3v4", "M5 10h14"],
  car: ["M4 16v-5l2-4h12l2 4v5", "M6 16h12", "M7 19h2", "M15 19h2", "M7 12h10"],
  check: ["m5 12 4 4L19 6"],
  chevron: ["m9 6 6 6-6 6"],
  clock: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18", "M12 7v5l3 2"],
  close: ["M6 6l12 12", "M18 6 6 18"],
  home: ["m4 11 8-7 8 7", "M6 10v10h12V10", "M10 20v-6h4v6"],
  language: ["M4 5h10", "M9 3v2c0 5-2 8-5 10", "M6 9c2 3 5 5 8 6", "m14 11 4 10", "m14 18 6 0"],
  map: ["m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2z", "M9 4v14", "M15 6v14"],
  plane: ["m3 11 18-7-7 17-3-6-5 2 2-5z"],
  route: ["M5 5h5a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h11", "m16 14 3 3-3 3"],
  search: ["M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12", "m15 15 5 5"],
  shield: ["M12 3 5 6v5c0 4 3 7 7 8 4-1 7-4 7-8V6z", "m9 12 2 2 4-5"],
  train: ["M6 4h12v12H6z", "M8 19l2-3", "M16 19l-2-3", "M9 8h6"],
  user: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8", "M5 21a7 7 0 0 1 14 0"],
  walk: ["M13 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0", "m11 8-2 5 3 2 2 6", "m9 13-4 7", "m11 9 4 3 4-1"],
};

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="shrink-0 stroke-current [stroke-linecap:round] [stroke-linejoin:round]"
      fill="none"
      height={size}
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name].map((d) => (
        <path d={d} key={d} />
      ))}
    </svg>
  );
}
