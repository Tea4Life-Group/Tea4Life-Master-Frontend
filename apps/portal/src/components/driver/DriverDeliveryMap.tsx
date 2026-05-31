import { useEffect, useMemo, useRef, useState } from "react";
// @ts-expect-error: goong-js has no bundled TS declaration in this repo
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";
import { goongApiV2 } from "@/lib/goong";
import { Loader2, MapPinned, Navigation, Truck } from "lucide-react";
import type { DriverLocationResponse } from "@/types/order/OrderResponse";

type MapPoint = { latitude: number; longitude: number };
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

interface DriverDeliveryMapProps {
  deliveryAddress: string;
  driverLocation: DriverLocationResponse | null;
  currentAddress?: string | null;
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

export default function DriverDeliveryMap({
  deliveryAddress,
  driverLocation,
  currentAddress,
}: DriverDeliveryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoongMap | null>(null);
  const driverMarkerRef = useRef<GoongMarker | null>(null);
  const destinationMarkerRef = useRef<GoongMarker | null>(null);
  const routeSourceId = "driver-delivery-route-source";

  const [deliveryPoint, setDeliveryPoint] = useState<MapPoint | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const latestDriverPoint = useMemo<MapPoint | null>(() => {
    if (!driverLocation) return null;
    return {
      latitude: driverLocation.latitude,
      longitude: driverLocation.longitude,
    };
  }, [driverLocation]);

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
        console.error("Không thể xác định tọa độ điểm giao hàng", error);
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
          const geojson = {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: decodePolyline(polyline),
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
                "line-color": "#059669",
                "line-width": 5,
                "line-opacity": 0.86,
              },
            });
          }
        }

        const driverMarker =
          driverMarkerRef.current || new goongjs.Marker({ color: "#2563eb" });
        driverMarker
          .setLngLat([latestDriverPoint.longitude, latestDriverPoint.latitude])
          .addTo(map);
        driverMarkerRef.current = driverMarker;

        const destinationMarker =
          destinationMarkerRef.current ||
          new goongjs.Marker({ color: "#dc2626" });
        destinationMarker
          .setLngLat([deliveryPoint.longitude, deliveryPoint.latitude])
          .addTo(map);
        destinationMarkerRef.current = destinationMarker;

        const bounds = new goongjs.LngLatBounds();
        bounds.extend([
          latestDriverPoint.longitude,
          latestDriverPoint.latitude,
        ]);
        bounds.extend([deliveryPoint.longitude, deliveryPoint.latitude]);
        map.fitBounds(bounds, { padding: 52, maxZoom: 15, duration: 700 });
      } catch (error) {
        console.error("Không thể tải tuyến đường giao hàng", error);
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

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400">
            Bản đồ giao hàng
          </p>
          <h3 className="mt-1 text-sm font-black text-slate-800">
            Vị trí hiện tại và tuyến đường ngắn nhất
          </h3>
          {currentAddress && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
              {currentAddress}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2 text-[10px] font-bold text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-blue-600" />
            Bạn
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPinned className="h-3.5 w-3.5 text-red-600" />
            Giao
          </span>
        </div>
      </div>

      <div className="relative h-[360px] bg-slate-100">
        <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />

        {(!latestDriverPoint || !deliveryPoint || loadingRoute) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 px-6 text-center text-slate-500">
              {latestDriverPoint ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Navigation className="h-6 w-6" />
              )}
              <p className="text-sm font-bold">
                {latestDriverPoint
                  ? "Đang tải bản đồ và tuyến đường..."
                  : "Đang chờ quyền truy cập vị trí tài xế..."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
