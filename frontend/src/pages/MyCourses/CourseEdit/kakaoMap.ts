export interface SearchPlace {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
}
export interface Point {
  getLat(): number;
  getLng(): number;
}
export interface MapInstance {
  setCenter(point: Point): void;
  setBounds(bounds: unknown): void;
  relayout(): void;
}
interface Overlay {
  setMap(map: MapInstance | null): void;
}
export interface KakaoMaps {
  load(callback: () => void): void;
  Map: new (node: HTMLElement, options: { center: Point; level: number }) => MapInstance;
  LatLng: new (latitude: number, longitude: number) => Point;
  LatLngBounds: new () => { extend(point: Point): void };
  CustomOverlay: new (options: {
    position: Point;
    content: HTMLElement;
    yAnchor: number;
  }) => Overlay;
  services: {
    Status: { OK: string; ZERO_RESULT: string };
    Places: new () => {
      keywordSearch(
        query: string,
        callback: (results: SearchPlace[], status: string) => void,
        options?: { location: Point; size: number },
      ): void;
    };
    Geocoder: new () => {
      addressSearch(
        address: string,
        callback: (results: Array<{ x: string; y: string }>, status: string) => void,
      ): void;
    };
  };
}

declare global {
  interface Window {
    kakao?: { maps: KakaoMaps };
  }
}
let sdkPromise: Promise<KakaoMaps> | undefined;

export function loadKakaoMap(): Promise<KakaoMaps> {
  if (sdkPromise) return sdkPromise;
  const key = import.meta.env.VITE_KAKAO_MAP_KEY?.trim();
  if (!key) return Promise.reject(new Error('지도 연결을 준비 중입니다.'));
  sdkPromise = new Promise<KakaoMaps>((resolve, reject) => {
    const script = document.createElement('script');
    const timer = window.setTimeout(() => fail(), 15000);
    let settled = false;
    function fail() {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      script.remove();
      reject(new Error('지도를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'));
    }
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false&libraries=services`;
    script.async = true;
    script.onerror = fail;
    script.onload = () => {
      if (!window.kakao?.maps) {
        fail();
        return;
      }
      window.kakao.maps.load(() => {
        if (settled) return;
        if (!window.kakao?.maps.services) {
          fail();
          return;
        }
        settled = true;
        window.clearTimeout(timer);
        resolve(window.kakao.maps);
      });
    };
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    sdkPromise = undefined;
    throw error;
  });
  return sdkPromise;
}

const coordinates = new Map<string, { latitude: number; longitude: number }>();
export async function locateAddress(maps: KakaoMaps, address: string) {
  const query = address.trim();
  if (!query || query === '주소를 입력해주세요.') return null;
  const cached = coordinates.get(query);
  if (cached) return cached;
  return new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
    const timer = window.setTimeout(() => resolve(null), 10000);
    new maps.services.Geocoder().addressSearch(query, (results, status) => {
      window.clearTimeout(timer);
      const first = results[0];
      if (status !== maps.services.Status.OK || !first) {
        resolve(null);
        return;
      }
      const point = { latitude: Number(first.y), longitude: Number(first.x) };
      if (!Number.isFinite(point.latitude) || !Number.isFinite(point.longitude)) {
        resolve(null);
        return;
      }
      coordinates.set(query, point);
      resolve(point);
    });
  });
}
