const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY;

if (!GOONG_API_KEY) {
  console.warn(
    "VITE_GOONG_API_KEY is not defined in .env. Goong Maps API requests may fail.",
  );
}

// ============== ĐỊNH NGHĨA GOONG REST API V2 =============
export const goongApiV2 = {
  // 1. Phân tích cụm từ tìm kiếm (Autocomplete V2)
  autocomplete: async (input: string) => {
    const res = await fetch(
      `https://rsapi.goong.io/v2/place/autocomplete?api_key=${GOONG_API_KEY}&input=${encodeURIComponent(
        input,
      )}&limit=5`,
    );
    return res.json();
  },

  // 2. Lấy chi tiết tọa độ của một địa điểm (Place Detail V2)
  placeDetail: async (place_id: string) => {
    const res = await fetch(
      `https://rsapi.goong.io/v2/place/detail?api_key=${GOONG_API_KEY}&place_id=${place_id}`,
    );
    return res.json();
  },

  // 3. Dịch ngược tọa độ ra địa chỉ (Geocode V2)
  reverseGeocode: async (lat: number, lng: number) => {
    const res = await fetch(
      `https://rsapi.goong.io/v2/geocode?api_key=${GOONG_API_KEY}&latlng=${lat},${lng}`,
    );
    return res.json();
  },

  // 4. Tìm vị trí từ địa chỉ (lấy prediction đầu tiên rồi lấy place detail)
  resolveAddress: async (address: string) => {
    const autocompleteRes = await goongApiV2.autocomplete(address);
    const firstPrediction = autocompleteRes?.predictions?.[0];

    if (!firstPrediction?.place_id) {
      return null;
    }

    const detailRes = await goongApiV2.placeDetail(firstPrediction.place_id);
    const location = detailRes?.result?.geometry?.location;

    if (!location) {
      return null;
    }

    return {
      latitude: location.lat,
      longitude: location.lng,
      formatted_address:
        detailRes?.result?.formatted_address || firstPrediction.description,
    };
  },

  // 5. Lấy tuyến đường giữa 2 tọa độ
  directions: async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
  ) => {
    const res = await fetch(
      `https://rsapi.goong.io/Direction?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&vehicle=car&api_key=${GOONG_API_KEY}`,
    );
    return res.json();
  },
};

// ============== Định nghĩa Type cho API V2 Response =============

export interface GoongAutocompletePrediction {
  description: string;
  place_id: string;
  reference: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  has_children: boolean;
  compound?: {
    district: string;
    commune: string;
    province: string;
  };
}

export interface GoongGeocodingResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
  name: string;
  address_components?: Array<{
    long_name: string;
    short_name: string;
  }>;
  compound?: {
    district: string;
    commune: string;
    province: string;
  };
}
