import { useMemo } from "react";

/** 데모용 의사 QR(실제 QR 코드가 아님). 레거시 QR과 같은 고정 시드라 매번 같은 무늬 */
export function FakeQR({ size = 150 }: { size?: number }) {
  const cells = useMemo(() => {
    const n = 21;
    const out: { x: number; y: number }[] = [];
    let seed = 7;
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const finder = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
        // 레거시 식 그대로(파인더 3곳에 같은 좌표 규칙을 쓴다 — 5단계 비교를 위해 보정하지 않음)
        const on = finder ? x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4) : rnd() > 0.55;
        if (on) out.push({ x, y });
      }
    return out;
  }, []);
  return (
    <svg viewBox="0 0 21 21" width={size} height={size} shapeRendering="crispEdges" aria-hidden>
      {cells.map(({ x, y }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} className="fill-ink" />
      ))}
    </svg>
  );
}
