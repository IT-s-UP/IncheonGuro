import { useEffect, useMemo, useRef, useState } from 'react';
import { loadKakaoMap, locateAddress, type Point } from '@/pages/MyCourses/CourseEdit/kakaoMap';
import type { CourseDay } from '@/pages/MyCourses/types';

import './CourseGuideRouteMap.css';

interface CourseGuideRouteMapProps {
  selectedDay: CourseDay;
  sheetHeight: number;
}

interface GeocodedPlace {
  name: string;
  point: Point;
}

function CourseGuideRouteMap({ selectedDay, sheetHeight }: CourseGuideRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const sheetHeightRef = useRef(sheetHeight);
  const [isGeocoding, setIsGeocoding] = useState(false);

  sheetHeightRef.current = sheetHeight;

  // 이 배열 자체를 useEffect 의존성으로 못 쓰니(매 렌더마다 새 참조), 주소만 이어붙여서 비교용 키로 사용
  const addressKey = useMemo(
    () => selectedDay.places.map((place) => place.address).join('|'),
    [selectedDay.places],
  );

  useEffect(() => {
    if (selectedDay.places.length === 0 || !mapContainerRef.current) return;

    let isCancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    setIsGeocoding(true);

    loadKakaoMap()
      .then(async (maps) => {
        if (isCancelled) return;

        // 장소들을 순서대로 좌표 확보. API가 이미 좌표를 준 장소는 그대로 쓰고,
        // 좌표가 없는 장소만 주소로 지오코딩(못 찾으면 건너뜀. 예: "주소를 입력해주세요.")
        const geocoded: GeocodedPlace[] = [];
        for (const place of selectedDay.places) {
          const hasCoordinates =
            typeof place.latitude === 'number' &&
            typeof place.longitude === 'number' &&
            Number.isFinite(place.latitude) &&
            Number.isFinite(place.longitude);

          const point = hasCoordinates
            ? { latitude: place.latitude as number, longitude: place.longitude as number }
            : await locateAddress(maps, place.address);

          if (point && !isCancelled) {
            geocoded.push({
              name: place.name,
              point: new maps.LatLng(point.latitude, point.longitude),
            });
          }
        }

        if (isCancelled || !mapContainerRef.current || geocoded.length === 0) {
          setIsGeocoding(false);
          return;
        }

        const center = geocoded[0].point;
        const map = new maps.Map(mapContainerRef.current, { center, level: 1 });

        // 컨테이너 크기가 늦게 확정되는 문제 때문에, relayout()과 화면 범위 조정(setBounds/setCenter)을
        // 먼저 끝낸 다음에 마커를 그려야 함. 순서를 반대로 하면(마커를 먼저 그리면) 카카오맵이
        // 아직 확정 안 된(0에 가까운) 컨테이너 크기 기준으로 좌표->픽셀 변환을 해버려서
        // 마커가 엉뚱한 위치로 가거나 아예 안 보이게 됨
        setTimeout(() => {
          if (!mapContainerRef.current) return;

          const fitMapToVisibleArea = () => {
            map.relayout();

            const bounds = new maps.LatLngBounds();
            geocoded.forEach((item) => bounds.extend(item.point));

            if (geocoded.length > 1) {
              const mapWithPadding = map as unknown as {
                setBounds(
                  bounds: unknown,
                  top: number,
                  right: number,
                  bottom: number,
                  left: number,
                ): void;
              };
              // 바텀시트가 지도의 아래를 가리므로, 그 높이만큼 안전 여백을 둔다.
              // 단, 시트가 지도 컨테이너 자체보다 큰 경우(바텀시트를 위로 많이 끌어올린 경우)
              // 여백이 컨테이너 높이를 거의 다 잡아먹어서 장소들이 아주 가까이 붙어있어도
              // 화면 전체를 줌아웃해버리는 문제가 있었음 - 여백은 컨테이너 높이의 60%로 제한
              const containerHeight = mapContainerRef.current?.clientHeight ?? 0;
              const bottomPadding = Math.min(sheetHeightRef.current + 28, containerHeight * 0.6);
              mapWithPadding.setBounds(bounds, 28, 20, bottomPadding, 20);
            } else {
              map.setCenter(center);
              const mapWithPan = map as unknown as { panBy(x: number, y: number): void };
              mapWithPan.panBy(0, -sheetHeightRef.current / 2);
              const mapWithLevel = map as unknown as { setLevel(level: number): void };
              mapWithLevel.setLevel(1);
            }
          };

          fitMapToVisibleArea();

          // relayout + 화면 범위 조정이 끝난 다음에야 마커를 그림
          geocoded.forEach((item, index) => {
            const markerEl = document.createElement('div');
            markerEl.style.cssText =
              'display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:#78aac3;border:3px solid #ffffff;box-shadow:0 2px 7px rgba(86,80,75,0.2);color:#ffffff;font-size:12px;font-weight:700;';
            markerEl.textContent = String(index + 1);

            // kakaoMap.ts의 CustomOverlay 타입엔 생성자에 map 옵션이 빠져있어서
            // (팀원 소유 파일이라 타입은 수정 안 함), 생성 직후 .setMap()을 명시적으로 호출해서
            // 실제로 지도에 붙여야 함
            const overlay = new maps.CustomOverlay({
              position: item.point,
              content: markerEl,
              yAnchor: 0.5,
            });
            overlay.setMap(map);
          });

          resizeObserver = new ResizeObserver(fitMapToVisibleArea);
          resizeObserver.observe(mapContainerRef.current);
        }, 0);

        setIsGeocoding(false);
      })
      .catch((error) => {
        console.error('코스 지도 로드 실패:', error);
        if (!isCancelled) setIsGeocoding(false);
      });

    return () => {
      isCancelled = true;
      resizeObserver?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressKey]);

  if (selectedDay.places.length === 0) {
    return (
      <section
        className="course-guide-detail-page__map"
        aria-label={`DAY ${selectedDay.day} 코스 지도`}
      >
        <div className="course-guide-detail-page__map-placeholder">
          DAY {selectedDay.day} 지도
          <br />
          장소를 추가해주세요.
        </div>
      </section>
    );
  }

  return (
    <section
      className="course-guide-detail-page__map"
      aria-label={`DAY ${selectedDay.day} 코스 지도`}
    >
      {isGeocoding && (
        <div className="course-guide-detail-page__map-placeholder">지도를 불러오는 중...</div>
      )}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </section>
  );
}

export default CourseGuideRouteMap;
