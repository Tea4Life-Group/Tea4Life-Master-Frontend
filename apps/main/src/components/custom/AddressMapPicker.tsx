import React, { useEffect, useRef, useCallback, useState } from "react";
// @ts-expect-error: Missing TypeScript declaration for goong-js
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";
import { goongApiV2 } from "@/lib/goong";
import type { GoongAutocompletePrediction } from "@/lib/goong";
import debounce from "lodash/debounce";
import { Search, MapPin as MapPinIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";

interface AddressMapPickerProps {
  onLocationSelect: (data: {
    province: string;
    ward: string;
    detail: string;
    latitude: number;
    longitude: number;
    addressText: string;
  }) => void;
  initialLatitude?: number;
  initialLongitude?: number;
}

export const AddressMapPicker: React.FC<AddressMapPickerProps> = ({
  onLocationSelect,
  initialLatitude = 21.0278, // Mặc định Hà Nội
  initialLongitude = 105.8342,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInsRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<GoongAutocompletePrediction[]>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const GOONG_MAP_KEY =
    import.meta.env.VITE_GOONG_MAPTILES_KEY ||
    import.meta.env.VITE_GOONG_API_KEY;

  const onLocationSelectRef = useRef(onLocationSelect);
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // Sử dụng debounce trong useRef kết hợp useEffect để tránh warning compiler cho Geocoding
  const debouncedGeocodeRef = useRef<ReturnType<typeof debounce> | null>(null);

  useEffect(() => {
    debouncedGeocodeRef.current = debounce((lng: number, lat: number) => {
      // Gọi API Geocoding (Dịch ngược tọa độ ra địa chỉ chữ) bằng V2
      goongApiV2
        .reverseGeocode(lat, lng)
        .then((response) => {
          const results = response.results;
          if (results && results.length > 0) {
            const place = results[0]; // Kết quả chính xác nhất thường ở mảng đầu tiên
            onLocationSelectRef.current({
              province: place.compound?.province || "",
              ward: place.compound?.commune || "",
              detail: place.formatted_address || "",
              latitude: lat,
              longitude: lng,
              addressText: place.formatted_address || "",
            });
          }
        })
        .catch((error: unknown) => {
          console.error("Lỗi khi lấy thông tin địa chỉ từ Goong:", error);
        });
    }, 800);

    return () => {
      if (debouncedGeocodeRef.current) {
        debouncedGeocodeRef.current.cancel();
      }
    };
  }, [onLocationSelect]);

  const handleDragEnd = useCallback((lng: number, lat: number) => {
    if (debouncedGeocodeRef.current) {
      debouncedGeocodeRef.current(lng, lat);
    }
  }, []);

  // Effect cho Map initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    goongjs.accessToken = GOONG_MAP_KEY;

    // Khởi tạo map
    const map = new goongjs.Map({
      container: mapContainerRef.current,
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center: [initialLongitude, initialLatitude],
      zoom: 13,
    });

    // Khởi tạo ghim thả được trên map
    const marker = new goongjs.Marker({ draggable: true, color: "#ef4444" })
      .setLngLat([initialLongitude, initialLatitude])
      .addTo(map);

    markerRef.current = marker;

    // Sự kiện kéo thả ghim vòng quanh
    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      handleDragEnd(lngLat.lng, lngLat.lat);
    });

    // Cập nhật vị trí ghim khi click trực tiếp (nhảy cóc điểm)
    map.on("click", (e: { lngLat: { lng: number; lat: number } }) => {
      marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
      handleDragEnd(e.lngLat.lng, e.lngLat.lat);
    });

    mapInsRef.current = map;

    return () => {
      map.remove(); // Dọn dẹp RAM khi React unmount
    };
  }, [GOONG_MAP_KEY, initialLatitude, initialLongitude, handleDragEnd]);

  // ---- Autocomplete Logic ----
  const debouncedSearchAutoComplete = React.useMemo(
    () =>
      debounce((query: string) => {
        if (!query.trim()) {
          setPredictions([]);
          setIsSearching(false);
          return;
        }

        setIsSearching(true);
        goongApiV2
          .autocomplete(query)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .then((response: any) => {
            if (response && response.predictions) {
              setPredictions(response.predictions);
              setShowDropdown(true);
            } else {
              setPredictions([]);
            }
            setIsSearching(false);
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .catch((error: any) => {
            console.error("Autocomplete error:", error);
            setPredictions([]);
            setIsSearching(false);
          });
      }, 500),
    [],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearchAutoComplete(value);
  };

  const handleSelectPrediction = (placeId: string, description: string) => {
    setSearchQuery(description);
    setShowDropdown(false);

    // Call PlaceDetail to get Lat/Lng
    goongApiV2
      .placeDetail(placeId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((response: any) => {
        if (response && response.result) {
          const result = response.result;
          const lat = result.geometry.location.lat;
          const lng = result.geometry.location.lng;

          // Fly Map To new Loc
          if (mapInsRef.current && markerRef.current) {
            mapInsRef.current.flyTo({
              center: [lng, lat],
              zoom: 15,
            });
            markerRef.current.setLngLat([lng, lat]);
            handleDragEnd(lng, lat);
          }
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((error: any) => {
        console.error("Place detail error:", error);
      });
  };

  // Close dropdown when typing outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[450px] rounded-xl overflow-hidden relative shadow-sm group font-sans border-2 border-emerald-100/60">
      {/* Thanh Search Autocomplete */}
      <div
        ref={searchContainerRef}
        className="absolute top-4 left-1/2 -translate-x-1/2 w-[92%] sm:w-[85%] lg:w-[70%] z-20 flex flex-col gap-2"
      >
        <div className="relative bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-emerald-100 flex items-center overflow-hidden h-12 transition-all focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500">
          <div className="pl-4 pr-2 text-emerald-600">
            <Search className="h-5 w-5" />
          </div>
          <Input
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => {
              if (predictions.length > 0) setShowDropdown(true);
            }}
            placeholder="Tìm địa chỉ (VD: Landmark 81, Hồ Gươm...)"
            className="flex-1 border-none shadow-none focus-visible:ring-0 px-2 placeholder:text-muted-foreground/80 bg-transparent text-[15px] font-medium text-emerald-950"
          />
          {isSearching && (
            <div className="pr-4 text-emerald-500">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>

        {/* Dropdown Kết quả */}
        {showDropdown && predictions.length > 0 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-emerald-100 max-h-[280px] overflow-y-auto w-full animate-in slide-in-from-top-2 flex flex-col pb-1">
            {predictions.map((p) => (
              <div
                key={p.place_id}
                onClick={() =>
                  handleSelectPrediction(p.place_id, p.description)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectPrediction(p.place_id, p.description);
                  }
                }}
                role="button"
                tabIndex={0}
                className="flex items-start gap-3 p-3.5 hover:bg-emerald-50 cursor-pointer transition-colors border-b last:border-0 border-gray-100 mx-2 mt-1 rounded-xl"
              >
                <div className="mt-0.5 text-emerald-600 bg-emerald-100/50 p-2 rounded-full shrink-0">
                  <MapPinIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 text-sm overflow-hidden flex flex-col justify-center min-h-[32px]">
                  <div className="font-semibold text-emerald-950 truncate leading-tight">
                    {p.structured_formatting?.main_text || p.description}
                  </div>
                  {p.structured_formatting?.secondary_text && (
                    <div className="text-[13px] text-muted-foreground/90 truncate mt-1">
                      {p.structured_formatting.secondary_text}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Container chứa Map */}
      <div ref={mapContainerRef} className="w-full h-[450px]" />
    </div>
  );
};
