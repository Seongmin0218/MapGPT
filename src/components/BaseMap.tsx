import { useEffect, useRef } from "react";
import {
  Map as MapLibreMap,
  NavigationControl,
  setWorkerUrl,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { MAP_CHROME, type ColorScheme } from "../theme";

setWorkerUrl(workerUrl);

export function BaseMap({ scheme }: { scheme: ColorScheme }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const map = new MapLibreMap({
      container: container.current,
      style: MAP_CHROME[scheme].basemapStyle,
      center: [126.978, 37.5665],
      zoom: 10.5,
    });

    map.addControl(
      new NavigationControl({ showCompass: false }),
      "top-right"
    );

    return () => map.remove();
  }, [scheme]);

  return (
    <div
      ref={container}
      className="map"
      aria-label="서울 기본 지도"
    />
  );
}