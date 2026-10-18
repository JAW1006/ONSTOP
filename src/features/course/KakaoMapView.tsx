// 카카오맵 JS SDK 구현. 키는 VITE_KAKAO_JS_KEY(공개용 JS 키, 등록 도메인 http://localhost:5173)에서 읽는다.
// 실제 확인 절차: docs/STATUS.md "실제 지도 확인 절차"
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { KAKAO_STROKE_STYLE, lineKind, polylineStyle } from "./map-style";
import type { MapScene, MapViewProps } from "./map-view";

/* eslint-disable @typescript-eslint/no-explicit-any -- 카카오 SDK는 타입 정의가 없다 */
declare global {
  interface Window {
    kakao?: any;
  }
}

/** 확대해야 후보·참고용 점이 보인다(레거시 PIN_VISIBLE_MAX_LEVEL, 숫자가 작을수록 확대) */
const DOT_VISIBLE_MAX_LEVEL = 6;

let sdkPromise: Promise<any> | null = null;
function loadKakao(): Promise<any> {
  if (window.kakao?.maps?.Map) return Promise.resolve(window.kakao);
  const key = import.meta.env.VITE_KAKAO_JS_KEY as string | undefined;
  if (!key) return Promise.reject(new Error("VITE_KAKAO_JS_KEY is not set"));
  sdkPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
    s.onload = () => window.kakao.maps.load(() => resolve(window.kakao));
    s.onerror = () => reject(new Error("kakao sdk load failed"));
    document.head.appendChild(s);
  });
  return sdkPromise;
}

function el(html: string, onClick?: () => void, ariaLabel?: string) {
  const d = document.createElement(onClick ? "button" : "div");
  d.innerHTML = html;
  if (onClick) {
    (d as HTMLButtonElement).type = "button";
    d.style.cssText = "border:none;background:none;padding:0;cursor:pointer;";
    d.addEventListener("click", onClick);
  }
  if (ariaLabel) d.setAttribute("aria-label", ariaLabel);
  return d;
}
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function pinHtml(pin: MapScene["pins"][number]) {
  const label = `<div style="margin-top:2px;padding:2px 7px;border-radius:999px;background:#fff;box-shadow:var(--ts-shadow-card);font:700 11px/1.3 var(--ts-font-sans);color:var(--ts-ink);white-space:nowrap">${esc(pin.label)}</div>`;
  const dot = (bg: string, inner: string, size = 28) =>
    `<div style="width:${size}px;height:${size}px;border-radius:999px;background:${bg};border:2px solid #fff;box-shadow:0 2px 6px rgb(0 0 0/.3);display:flex;align-items:center;justify-content:center;color:#fff;font:800 13px var(--ts-font-sans)">${inner}</div>`;
  const body =
    pin.kind === "airport"
      ? dot("var(--ts-role-airport)", "✈")
      : pin.kind === "hotel"
        ? dot("var(--ts-role-base)", "H", 30)
        : pin.kind === "hotel-other"
          ? dot("var(--ts-role-candidate)", "H", 22)
          : dot("var(--ts-role-place)", String(pin.number ?? ""));
  return `<div style="display:flex;flex-direction:column;align-items:center">${body}${pin.kind === "hotel-other" ? "" : label}</div>`;
}

function chipHtml(leg: MapScene["legs"][number], selected: boolean) {
  const color = leg.isReturn ? "var(--ts-role-return)" : "var(--ts-role-route-text)";
  const border = leg.isReturn ? "1.5px dashed var(--ts-role-return)" : "1.5px solid var(--ts-role-route)";
  const sub = leg.chip.sub
    ? `<span style="font:600 10px var(--ts-font-sans);color:var(--ts-sub);margin-left:3px">${esc(leg.chip.sub)}</span>`
    : "";
  return `<div style="display:inline-flex;align-items:baseline;gap:3px;padding:3px 8px;border-radius:999px;background:#fff;border:${border};box-shadow:${selected ? "0 0 0 3px rgb(14 140 132/.25)" : "var(--ts-shadow-card)"};white-space:nowrap"><span aria-hidden="true">${leg.chip.icon}</span><b style="font:800 13px var(--ts-font-sans);color:${color}">${esc(leg.chip.text)}</b>${sub}</div>`;
}

export function KakaoMapView({ scene, onPinClick, onDotClick, onLegClick, unavailableText }: MapViewProps) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const drawn = useRef<any[]>([]);
  const [error, setError] = useState(false);
  const [level, setLevel] = useState(7);
  const centerKey = `${scene.center.lat},${scene.center.lng}`;

  useEffect(() => {
    let cancelled = false;
    loadKakao()
      .then((kakao) => {
        if (cancelled || !host.current || map.current) return;
        map.current = new kakao.maps.Map(host.current, {
          center: new kakao.maps.LatLng(scene.center.lat, scene.center.lng),
          level: 7,
        });
        kakao.maps.event.addListener(map.current, "zoom_changed", () => setLevel(map.current.getLevel()));
        setLevel(map.current.getLevel());
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
    // 지도는 한 번만 만든다. 중심 이동은 아래 효과에서
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 숙소를 바꿀 때만 중심 이동(확대해서 보던 화면을 매번 되돌리지 않는다 — 레거시 수정 사항 유지)
  useEffect(() => {
    const kakao = window.kakao;
    if (map.current && kakao) map.current.setCenter(new kakao.maps.LatLng(scene.center.lat, scene.center.lng));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerKey]);

  useEffect(() => {
    const kakao = window.kakao;
    if (!map.current || !kakao) return;
    drawn.current.forEach((o) => o.setMap(null));
    drawn.current = [];
    const add = (o: any) => {
      o.setMap(map.current);
      drawn.current.push(o);
    };
    const latLng = (p: { lat: number; lng: number }) => new kakao.maps.LatLng(p.lat, p.lng);

    scene.legs.forEach((leg) => {
      const selection = scene.selectedLeg == null ? "none" : scene.selectedLeg === leg.index ? "selected" : "dimmed";
      const kind = lineKind(leg.mode, leg.isReturn);
      const pts = leg.path && leg.path.length > 1 ? leg.path : [leg.from, leg.to];
      const line = new kakao.maps.Polyline({
        path: pts.map(latLng),
        ...polylineStyle(kind, selection),
        strokeStyle: KAKAO_STROKE_STYLE[kind],
      });
      kakao.maps.event.addListener(line, "click", () => onLegClick(leg.index));
      add(line);
      const mid = pts[Math.floor((pts.length - 1) / 2)]!;
      const at =
        pts.length === 2 ? { lat: (pts[0]!.lat + pts[1]!.lat) / 2, lng: (pts[0]!.lng + pts[1]!.lng) / 2 } : mid;
      add(
        new kakao.maps.CustomOverlay({
          position: latLng(at),
          content: el(chipHtml(leg, scene.selectedLeg === leg.index), () => onLegClick(leg.index), leg.chip.ariaLabel),
          yAnchor: 0.5,
          zIndex: 3,
        }),
      );
    });
    scene.pins.forEach((pin) => {
      const clickable = pin.kind !== "airport";
      add(
        new kakao.maps.CustomOverlay({
          position: latLng(pin.coord),
          content: el(pinHtml(pin), clickable ? () => onPinClick(pin.id) : undefined, pin.label),
          yAnchor: 0.85,
          zIndex: pin.kind === "place" ? 5 : 4,
        }),
      );
    });
    if (level <= DOT_VISIBLE_MAX_LEVEL) {
      scene.dots.forEach((dot) => {
        const size = dot.kind === "candidate" ? 11 : 8;
        const html = `<div title="${esc(dot.name)}" style="width:${size}px;height:${size}px;border-radius:999px;background:var(--ts-role-candidate);border:1.5px solid #fff;box-shadow:0 1px 3px rgb(0 0 0/.3)"></div>`;
        add(
          new kakao.maps.CustomOverlay({
            position: latLng(dot.coord),
            content: el(html, () => onDotClick(dot.id), dot.name),
            yAnchor: 0.5,
            zIndex: 1,
          }),
        );
      });
    }
  }, [scene, level, onPinClick, onDotClick, onLegClick]);

  if (error) return <Card className="p-5 text-center text-caption text-faint">{unavailableText}</Card>;
  return <div ref={host} className="h-[320px] w-full overflow-hidden rounded-lg border border-line" />;
}
