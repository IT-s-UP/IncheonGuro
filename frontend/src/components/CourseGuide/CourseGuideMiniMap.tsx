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

  // 좌표가 유효한 장소만 남김 (백엔드에서 좌표를 못 찾은 정거장이 섞여 있을 수 있음)
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

          const markerEl = document.createElement('div');
          markerEl.style.cssText =
            'width:16px;height:16px;border-radius:50% 50% 50% 0;background:#78aac3;transform:rotate(-45deg);border:2px solid #ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.3);';
          new maps.CustomOverlay({ position, content: markerEl, yAnchor: 1 });
        });

        // 장소 안내 상세 지도 때와 동일한 패턴: 컨테이너 크기가 늦게 확정되는 문제 때문에
        // relayout()을 setTimeout(0)으로 감싸서 지도 생성 직후 강제로 다시 계산시킴
        setTimeout(() => {
          map.relayout();

          if (validPlaces.length > 1) {
            // kakaoMap.ts의 MapInstance 타입엔 setBounds가 인자 1개짜리로만 선언돼 있어서
            // (팀원 소유 파일이라 타입 자체는 수정 안 함), 카카오 SDK가 런타임에 실제로 지원하는
            // 여백(padding) 인자를 as로 우회해서 넘김. 기본 setBounds는 여백을 넉넉히 잡아서
            // 너무 멀리 빠지길래, 여백을 10px로 확 줄여서 더 세밀하게 보이도록 함
            const mapWithPadding = map as unknown as {
              setBounds(
                bounds: unknown,
                top: number,
                right: number,
                bottom: number,
                left: number,
              ): void;
            };
            mapWithPadding.setBounds(bounds, 10, 10, 10, 10);
          } else {
            map.setCenter(center);
          }
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
