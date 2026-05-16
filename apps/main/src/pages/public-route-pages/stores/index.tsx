import { useState, useEffect, useRef } from "react";
// @ts-expect-error: Missing TypeScript declaration for goong-js
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";
import { findAllStoresApi } from "@/services/storeApi";
import type { StoreResponse } from "@/types/store/StoreResponse";
import { MapPin, Loader2, Store } from "lucide-react";
import { handleError } from "@/lib/utils";

export default function StoresPage() {
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInsRef = useRef<any>(null);
  const [activeStore, setActiveStore] = useState<StoreResponse | null>(null);

  const GOONG_MAP_KEY =
    import.meta.env.VITE_GOONG_MAPTILES_KEY ||
    import.meta.env.VITE_GOONG_API_KEY;

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await findAllStoresApi();
      setStores(res.data.data || []);
    } catch (error) {
      handleError(error, "Không thể tải danh sách cửa hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || stores.length === 0) return;

    goongjs.accessToken = GOONG_MAP_KEY;

    let centerLng = 105.8342;
    let centerLat = 21.0278;

    if (stores[0]?.longitude && stores[0]?.latitude) {
      centerLng = stores[0].longitude;
      centerLat = stores[0].latitude;
    }

    const map = new goongjs.Map({
      container: mapContainerRef.current,
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center: [centerLng, centerLat],
      zoom: 12,
    });

    const bounds = new goongjs.LngLatBounds();
    let hasBounds = false;

    // Add markers
    stores.forEach((store) => {
      if (store.longitude && store.latitude) {
        hasBounds = true;
        bounds.extend([store.longitude, store.latitude]);

        const markerInstance = new goongjs.Marker({ color: "#1A4331" })
          .setLngLat([store.longitude, store.latitude])
          .setPopup(
            new goongjs.Popup({ offset: 25 }).setHTML(`
              <div style="font-family: inherit; color: #1A4331; padding: 6px; min-width: 180px;">
                <h3 style="font-weight: bold; font-size: 15px; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                  <span style="color: #8A9A7A;">🌿</span> ${store.name}
                </h3>
                <p style="font-size: 13px; margin: 0; color: #555; line-height: 1.4;">${store.address}</p>
              </div>
            `)
          )
          .addTo(map);

        markerInstance.getElement().addEventListener("click", () => {
          setActiveStore(store);
        });
      }
    });

    if (hasBounds) {
      // Fit bounds and resize when map is fully loaded to prevent partial render
      map.on('load', () => {
        map.resize();
        map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
      });
    } else {
      map.on('load', () => {
        map.resize();
      });
    }

    // Backup resize in case map loads too fast before DOM settles
    setTimeout(() => {
      map.resize();
    }, 200);

    mapInsRef.current = map;

    return () => {
      map.remove();
    };
  }, [stores, GOONG_MAP_KEY]);

  const handleStoreClick = (store: StoreResponse) => {
    setActiveStore(store);
    if (mapInsRef.current && store.longitude && store.latitude) {
      mapInsRef.current.flyTo({
        center: [store.longitude, store.latitude],
        zoom: 16,
        essential: true,
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F8F5F0] text-[#1A4331] font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage:
            "linear-gradient(#1A4331 1px, transparent 1px), linear-gradient(90deg, #1A4331 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8 border-b-2 border-[#1A4331]/10 pb-6 text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Store className="w-5 h-5 text-[#8A9A7A]" />
            <p className="text-[#8A9A7A] font-bold text-sm uppercase tracking-wider">
              Tâm Điểm Hội Ngộ
            </p>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight pixel-text text-[#1A4331]">
            Hệ Thống Cửa Hàng
          </h1>
          <p className="text-[#8A9A7A] font-medium leading-relaxed">
            Tìm vị trí Tea4Life gần bạn nhất. Đến với chúng tôi để trải nghiệm không gian xanh mát và thưởng thức những thức uống tuyệt hảo ngập tràn hương vị.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-[#8A9A7A]">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <p className="font-bold text-sm uppercase tracking-wider animate-pulse">
              Đang định vị bản đồ...
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row shadow-[8px_8px_0px_rgba(26,67,49,0.1)] bg-white border-2 border-[#1A4331]/20 rounded-xl overflow-hidden relative">
            {/* Store List */}
            <div className="w-full lg:w-[35%] xl:w-[30%] border-b lg:border-b-0 lg:border-r-2 border-[#1A4331]/10 bg-[#F8F5F0]/60 flex flex-col h-[400px] lg:h-[600px] shrink-0">
              <div className="p-5 border-b-2 border-[#1A4331]/10 bg-white sticky top-0 z-10 shrink-0 shadow-sm">
                <h2 className="font-bold text-[#1A4331] uppercase tracking-wide flex items-center gap-2 text-[15px]">
                  Danh sách chi nhánh
                  <span className="bg-[#1A4331] text-white px-2 py-0.5 rounded-full text-xs ml-auto">
                    {stores.length}
                  </span>
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {stores.length === 0 ? (
                  <p className="text-center text-[#8A9A7A] mt-10 text-sm font-medium">
                    Chính thức ra mắt sớm.
                  </p>
                ) : (
                  stores.map((store) => (
                    <div
                      key={store.id}
                      onClick={() => handleStoreClick(store)}
                      className={`p-4 cursor-pointer transition-all border-l-[3px] shadow-sm ${
                        activeStore?.id === store.id
                          ? "bg-white border-[#D2A676] shadow-md -translate-y-0.5"
                          : "bg-white/50 border-transparent hover:bg-white hover:border-[#1A4331]/20"
                      }`}
                    >
                      <h3
                        className={`font-bold mb-1.5 flex items-start gap-2 text-[15px] ${
                          activeStore?.id === store.id
                            ? "text-[#1A4331]"
                            : "text-[#1A4331]/80"
                        }`}
                      >
                        <MapPin
                          className={`h-4 w-4 mt-0.5 shrink-0 ${
                            activeStore?.id === store.id
                              ? "text-[#D2A676]"
                              : "text-[#8A9A7A]"
                          }`}
                        />
                        {store.name}
                      </h3>
                      <p
                        className={`text-[13px] leading-relaxed pl-6 ${
                          activeStore?.id === store.id
                            ? "text-[#8A9A7A] font-medium"
                            : "text-[#8A9A7A]/80"
                        }`}
                      >
                        {store.address}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Map Container */}
            <div className="w-full lg:w-[65%] xl:w-[70%] h-[400px] lg:h-[600px] relative bg-[#e5e3df] shrink-0">
              <div className="w-full h-full z-0 relative" ref={mapContainerRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
