import { useEffect, useMemo, useRef } from 'react';
import { loadKakaoMap } from '@/pages/MyCourses/CourseEdit/kakaoMap';
import type { Place } from '@/api/courseGuide';
import './CourseGuideMiniMap.css';

interface CourseGuideMiniMapProps {
  places: Place[];
}

// "코스 추천" 탭의 간략 지도 - 코스에 속한 장소들을 전부 마커로 찍고, 한 화면에 다 들어오도록 자동 줌/센터 맞춤
function CourseGuideMiniMap({ places }: CourseGuideMiniMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const validPlaces = useMemo(
    () =>
      places.filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude)),
    [places],
  );

  useEffect(() => {
    if (validPlaces.length === 0 || !mapContainerRef.current) return;

    let isCancelled = false;

    loadKakaoMap()
      .then((maps) => {
        if (isCancelled || !mapContainerRef.current) return;

        const firstPlace = validPlaces[0];
        const center = new maps.LatLng(firstPlace.latitude, firstPlace.longitude);
        const map = new maps.Map(mapContainerRef.current, { center, level: 4 });

        const bounds = new maps.LatLngBounds();

        validPlaces.forEach((place) => {
          const position = new maps.LatLng(place.latitude, place.longitude);
          bounds.extend(position);
        });

        setTimeout(() => {
          if (!mapContainerRef.current) return;

          map.relayout();

          if (validPlaces.length > 1) {
            map.setBounds(bounds);
          } else {
            map.setCenter(center);
          }

          validPlaces.forEach((place, index) => {
            const position = new maps.LatLng(place.latitude, place.longitude);

            const markerEl = document.createElement('div');
            markerEl.style.cssText =
              'display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:#78aac3;border:3px solid #ffffff;box-shadow:0 2px 7px rgba(86,80,75,0.2);color:#ffffff;font-size:12px;font-weight:700;';
            markerEl.textContent = String(index + 1);

            const overlay = new maps.CustomOverlay({ position, content: markerEl, yAnchor: 0.5 });
            overlay.setMap(map);
          });
        }, 0);
      })
      .catch((error) => console.error('간략 지도 로드 실패:', error));

    return () => {
      isCancelled = true;
    };
  }, [validPlaces]);

  if (validPlaces.length === 0) {
    return <div className="course-guide-mini-map course-guide-mini-map--empty">간략 지도</div>;
  }

  return <div ref={mapContainerRef} className="course-guide-mini-map" />;
}

export default CourseGuideMiniMap;
