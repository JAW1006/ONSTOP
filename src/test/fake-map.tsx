import type { MapScene, MapViewProps } from "@/features/course/map-view";

/** 마지막으로 그린 장면 — 테스트에서 핀·구간·선택 상태를 직접 확인 */
export const fakeMap: { scene: MapScene | null } = { scene: null };

/** 카카오맵 대신 장면을 버튼 목록으로 그리는 모의 지도 */
export function FakeMapView({ scene, onPinClick, onDotClick, onLegClick }: MapViewProps) {
  fakeMap.scene = scene;
  return (
    <div data-testid="fake-map">
      <ul aria-label="map pins">
        {scene.pins.map((p) => (
          <li key={p.id}>
            <button type="button" data-pin={p.id} data-kind={p.kind} data-number={p.number ?? ""} onClick={() => onPinClick(p.id)}>
              {p.label}
            </button>
          </li>
        ))}
      </ul>
      <ul aria-label="map legs">
        {scene.legs.map((l) => (
          <li key={l.index}>
            <button
              type="button"
              aria-label={l.chip.ariaLabel}
              data-leg={l.index}
              data-mode={l.mode}
              data-return={String(l.isReturn)}
              data-selected={String(scene.selectedLeg === l.index)}
              onClick={() => onLegClick(l.index)}
            >
              {l.chip.text}
              {l.chip.sub ? ` ${l.chip.sub}` : ""}
            </button>
          </li>
        ))}
      </ul>
      <ul aria-label="map dots">
        {scene.dots.map((d) => (
          <li key={d.id}>
            <button type="button" data-dot={d.id} data-kind={d.kind} onClick={() => onDotClick(d.id)}>
              {d.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
