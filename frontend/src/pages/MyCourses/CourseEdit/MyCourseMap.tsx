import { useEffect, useRef, useState } from 'react';
import type { CoursePlace } from '../types';
import { loadKakaoMap, locateAddress } from './kakaoMap';
import './MyCourseMap.css';

interface Props {
  places: CoursePlace[];
  day: number;
}

export default function MyCourseMap({ places, day }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('지도를 불러오는 중입니다.');
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = container.current;
    if (!node) return;
    let cancelled = false;
    let markerRenderTimer: number | undefined;
    let dispose = () => {};
    setFailed(false);
    setMessage('지도를 불러오는 중입니다.');
    void loadKakaoMap()
      .then(async (maps) => {
        if (cancelled) return;
        const center = new maps.LatLng(37.4563, 126.7052);
        const map = new maps.Map(node, { center, level: 5 });
        const overlays: InstanceType<typeof maps.CustomOverlay>[] = [];
        let points: InstanceType<typeof maps.LatLng>[] = [];
        const fit = () => {
          map.relayout();
          if (points.length === 1) {
            map.setCenter(points[0]);
          }
          else if (points.length > 1) {
            const bounds = new maps.LatLngBounds();
            points.forEach((point) => bounds.extend(point));
            const mapWithPadding = map as unknown as {
              setBounds(
                nextBounds: unknown,
                top: number,
                right: number,
                bottom: number,
                left: number,
              ): void;
            };
            mapWithPadding.setBounds(bounds, 28, 20, 28, 20);
          }
        };
        // 아래 패널을 움직일 때는 지도 크기만 다시 계산한다.
        // 이때 범위까지 다시 맞추면 사용자가 보던 위치가 계속 바뀐다.
        const observer = new ResizeObserver(() => map.relayout());
        observer.observe(node);
        dispose = () => {
          observer.disconnect();
          if (markerRenderTimer !== undefined) window.clearTimeout(markerRenderTimer);
          overlays.forEach((overlay) => overlay.setMap(null));
          node.replaceChildren();
        };
        setMessage(
          places.length ? '장소 위치를 확인하는 중입니다.' : '장소를 추가하면 지도에 표시됩니다.',
        );
        const resolved = await Promise.all(
          places.map(async (place) => {
            if (
              typeof place.latitude === 'number' &&
              typeof place.longitude === 'number' &&
              Number.isFinite(place.latitude) &&
              Number.isFinite(place.longitude) &&
              Math.abs(place.latitude) <= 90 &&
              Math.abs(place.longitude) <= 180
            ) {
              return { latitude: place.latitude, longitude: place.longitude };
            }
            return locateAddress(maps, place.address);
          }),
        );
        if (cancelled) return;
        points = [];
        resolved.forEach((position) => {
          if (!position) return;
          const point = new maps.LatLng(position.latitude, position.longitude);
          points.push(point);
        });

        // 지도 영역과 범위를 확정한 뒤 마커를 올려야 좌표가 가려지지 않는다.
        markerRenderTimer = window.setTimeout(() => {
          if (cancelled) return;

          fit();

          resolved.forEach((position, index) => {
            if (!position) return;

            const point = new maps.LatLng(position.latitude, position.longitude);
          const label = document.createElement('span');
          label.className = 'my-course-map__marker';
          label.textContent = String(index + 1);
          label.title = `${index + 1}. ${places[index].name}`;
          label.setAttribute('aria-label', label.title);
          const overlay = new maps.CustomOverlay({ position: point, content: label, yAnchor: 1 });
          overlay.setMap(map);
          overlays.push(overlay);
          });
        }, 0);
        const missing = resolved.filter((position) => !position).length;
        setMessage(
          missing
            ? `${missing}개 장소의 위치를 찾지 못했습니다. 상세 주소를 확인해주세요.`
            : places.length
              ? ''
              : '장소를 추가하면 지도에 표시됩니다.',
        );
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setFailed(Boolean(import.meta.env.VITE_KAKAO_MAP_KEY?.trim()));
        setMessage(error instanceof Error ? error.message : '지도를 불러오지 못했습니다.');
      });
    return () => {
      cancelled = true;
      dispose();
    };
  }, [places, day, attempt]);

  return (
    <div className="my-course-map">
      <div className="my-course-map__canvas" ref={container} aria-label={`DAY ${day} 장소 지도`} />
      {message && (
        <div className="my-course-map__status" role="status">
          {message}
          {failed && (
            <button type="button" onClick={() => setAttempt((value) => value + 1)}>
              다시 시도
            </button>
          )}
        </div>
      )}
    </div>
  );
}
