import { useEffect, useMemo, useRef, useState } from "react";
// @ts-expect-error: goong-js has no bundled TS declaration in this repo
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";
import { goongApiV2 } from "@/lib/goong";
import { Loader2, MapPinned, Truck } from "lucide-react";
import type { DriverLocationResponse } from "@/types/order/OrderResponse";

type TrackingMapPoint = { latitude: number; longitude: number };
type LngLat = [number, number];
type GoongGeoJsonSource = { setData: (data: unknown) => void };
type GoongMap = {
  resize: () => void;
  remove: () => void;
  isStyleLoaded: () => boolean;
  once: (eventName: string, callback: () => void) => void;
  getSource: (id: string) => GoongGeoJsonSource | undefined;
  addSource: (id: string, source: unknown) => void;
  addLayer: (layer: unknown) => void;
  fitBounds: (bounds: unknown, options: unknown) => void;
};
type GoongMarker = {
  setLngLat: (lngLat: LngLat) => GoongMarker;
  addTo: (map: GoongMap) => GoongMarker;
};

interface OrderTrackingMapProps {
  deliveryAddress: string;
  driverLocation: DriverLocationResponse | null;
  onDistanceToDeliveryChange?: (distanceMeters: number | null) => void;
}

function decodePolyline(encoded: string): Array<[number, number]> {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates: Array<[number, number]> = [];

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push([lng / 1e5, lat / 1e5]);
  }

  return coordinates;
}

function calculateDistanceMeters(
  from: TrackingMapPoint,
  to: TrackingMapPoint,
) {
  const earthRadiusMeters = 6371000;
  const toRadians = (degree: number) => (degree * Math.PI) / 180;
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);
  const fromLat = toRadians(from.latitude);
  const toLat = toRadians(to.latitude);

  const haversine =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(fromLat) *
      Math.cos(toLat) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  return (
    2 *
    earthRadiusMeters *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

export default function OrderTrackingMap({
  deliveryAddress,
  driverLocation,
  onDistanceToDeliveryChange,
}: OrderTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoongMap | null>(null);
  const routeSourceId = "tracking-route-source";
  const driverMarkerRef = useRef<GoongMarker | null>(null);
  const destinationMarkerRef = useRef<GoongMarker | null>(null);

  const [loadingRoute, setLoadingRoute] = useState(true);
  const [deliveryPoint, setDeliveryPoint] = useState<TrackingMapPoint | null>(
    null,
  );

  const latestDriverPoint = useMemo<TrackingMapPoint | null>(() => {
    if (!driverLocation) return null;
    return {
      latitude: driverLocation.latitude,
      longitude: driverLocation.longitude,
    };
  }, [driverLocation]);

  useEffect(() => {
    if (!onDistanceToDeliveryChange) return;

    if (!latestDriverPoint || !deliveryPoint) {
      onDistanceToDeliveryChange(null);
      return;
    }

    onDistanceToDeliveryChange(
      calculateDistanceMeters(latestDriverPoint, deliveryPoint),
    );
  }, [latestDriverPoint, deliveryPoint, onDistanceToDeliveryChange]);

  useEffect(() => {
    let ignore = false;

    const resolveDeliveryPoint = async () => {
      if (!deliveryAddress.trim()) {
        setDeliveryPoint(null);
        return;
      }

      try {
        const resolved = await goongApiV2.resolveAddress(deliveryAddress);
        if (!ignore && resolved) {
          setDeliveryPoint({
            latitude: resolved.latitude,
            longitude: resolved.longitude,
          });
        }
      } catch (error) {
        console.error("Không thể xác định tọa độ địa chỉ giao hàng", error);
      }
    };

    resolveDeliveryPoint();

    return () => {
      ignore = true;
    };
  }, [deliveryAddress]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const goongMapKey =
      import.meta.env.VITE_GOONG_MAPTILES_KEY ||
      import.meta.env.VITE_GOONG_API_KEY;

    if (!goongMapKey) return;

    goongjs.accessToken = goongMapKey;

    const map = new goongjs.Map({
      container: mapContainerRef.current,
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center: [106.70098, 10.77653],
      zoom: 12,
    });

    mapRef.current = map;

    const handleResize = () => {
      map.resize();
    };

    window.setTimeout(handleResize, 0);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !latestDriverPoint || !deliveryPoint) return;

    const renderRoute = async () => {
      try {
        setLoadingRoute(true);

        const directions = await goongApiV2.directions(
          { lat: latestDriverPoint.latitude, lng: latestDriverPoint.longitude },
          { lat: deliveryPoint.latitude, lng: deliveryPoint.longitude },
        );

        const route = directions?.routes?.[0];
        const polyline =
          route?.overview_polyline?.points || route?.overview_polyline;

        if (polyline) {
          const coordinates = decodePolyline(polyline);
          const geojson = {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates,
            },
            properties: {},
          };

          const existingSource = map.getSource(routeSourceId);
          if (existingSource) {
            existingSource.setData(geojson);
          } else {
            map.addSource(routeSourceId, {
              type: "geojson",
              data: geojson,
            });

            map.addLayer({
              id: `${routeSourceId}-line`,
              type: "line",
              source: routeSourceId,
              paint: {
                "line-color": "#0f766e",
                "line-width": 5,
                "line-opacity": 0.85,
              },
            });
          }
        }

        const driverMarkerEl =
          driverMarkerRef.current || new goongjs.Marker({ color: "#2563eb" });
        driverMarkerEl
          .setLngLat([latestDriverPoint.longitude, latestDriverPoint.latitude])
          .addTo(map);
        driverMarkerRef.current = driverMarkerEl;

        const destinationMarkerEl =
          destinationMarkerRef.current ||
          new goongjs.Marker({ color: "#dc2626" });
        destinationMarkerEl
          .setLngLat([deliveryPoint.longitude, deliveryPoint.latitude])
          .addTo(map);
        destinationMarkerRef.current = destinationMarkerEl;

        const bounds = new goongjs.LngLatBounds();
        bounds.extend([
          latestDriverPoint.longitude,
          latestDriverPoint.latitude,
        ]);
        bounds.extend([deliveryPoint.longitude, deliveryPoint.latitude]);
        map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 700 });
      } catch (error) {
        console.error("Không thể tải tuyến đường", error);
      } finally {
        setLoadingRoute(false);
      }
    };

    window.setTimeout(() => map.resize(), 0);
    if (map.isStyleLoaded()) {
      renderRoute();
    } else {
      map.once("load", renderRoute);
    }
  }, [latestDriverPoint, deliveryPoint]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !latestDriverPoint || !driverMarkerRef.current) return;
    driverMarkerRef.current.setLngLat([
      latestDriverPoint.longitude,
      latestDriverPoint.latitude,
    ]);
  }, [latestDriverPoint]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !deliveryPoint || !destinationMarkerRef.current) return;
    destinationMarkerRef.current.setLngLat([
      deliveryPoint.longitude,
      deliveryPoint.latitude,
    ]);
  }, [deliveryPoint]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">
            Bản đồ giao hàng
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Hiển thị vị trí hiện tại của shipper và tuyến đường gợi ý
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-blue-600" />
            Tài xế
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPinned className="h-3.5 w-3.5 text-red-600" />
            Điểm giao
          </span>
        </div>
      </div>

      <div className="relative h-[420px] sm:h-[480px] bg-slate-100">
        <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />

        {(!latestDriverPoint || !deliveryPoint || loadingRoute) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm font-medium">
                Đang tải bản đồ và tuyến đường...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
