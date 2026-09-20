import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown from '@/components/Dropdown/Dropdown';
import type { PlaceSummary } from '@/api/placeGuide';
import './PlaceGuideNearbyPanel.css';

// 패널이 멈출 수 있는 3단계 높이 - 부모(지도 영역) 높이 기준 퍼센트(%)
const SNAP_POINTS = [20, 45, 90];
const CLICK_THRESHOLD = 5;

const SORT_OPTIONS = [
  { label: '가까운순', value: 'near' },
  { label: '이름순', value: 'name' },
];

interface PlaceGuideNearbyPanelProps {
  places: PlaceSummary[];
}

function getClosestSnapPoint(current: number): number {
  return SNAP_POINTS.reduce((closest, point) =>
    Math.abs(point - current) < Math.abs(closest - current) ? point : closest,
  );
}

function PlaceGuideNearbyPanel({ places }: PlaceGuideNearbyPanelProps) {
  const navigate = useNavigate();
  const [heightPercent, setHeightPercent] = useState(SNAP_POINTS[1]);
  const [sortValue, setSortValue] = useState('near');

  const panelRef = useRef<HTMLDivElement>(null);
  const parentHeightRef = useRef(0); // 부모(지도 영역)의 실제 픽셀 높이, 드래그 계산용으로만 사용

  const dragStartY = useRef(0);
  const dragStartHeightPercent = useRef(0);
  const isDragging = useRef(false);
  const hasMoved = useRef(false);

  const minHeightPercent = SNAP_POINTS[0];
  const maxHeightPercent = SNAP_POINTS[SNAP_POINTS.length - 1];

  // 부모 요소의 실제 높이를 측정해서 저장해둠 (드래그 시 px -> % 환산에 필요)
  // 화면 크기가 바뀔 수도 있으니 ResizeObserver로 계속 갱신
  useEffect(() => {
    const parentEl = panelRef.current?.parentElement;
    if (!parentEl) return;

    const updateParentHeight = () => {
      parentHeightRef.current = parentEl.clientHeight;
    };

    updateParentHeight();

    const resizeObserver = new ResizeObserver(updateParentHeight);
    resizeObserver.observe(parentEl);

    return () => resizeObserver.disconnect();
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLSpanElement>) => {
    isDragging.current = true;
    hasMoved.current = false;
    dragStartY.current = event.clientY;
    dragStartHeightPercent.current = heightPercent;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (!isDragging.current) return;

    const parentHeight = parentHeightRef.current;
    if (!parentHeight) return;

    const deltaPx = dragStartY.current - event.clientY;

    if (Math.abs(deltaPx) > CLICK_THRESHOLD) {
      hasMoved.current = true;
    }

    // 움직인 픽셀 거리를, 부모 높이 기준 퍼센트로 환산
    const deltaPercent = (deltaPx / parentHeight) * 100;

    const nextHeightPercent = dragStartHeightPercent.current + deltaPercent;
    const clamped = Math.min(maxHeightPercent, Math.max(minHeightPercent, nextHeightPercent));
    setHeightPercent(clamped);
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (hasMoved.current) {
      setHeightPercent((current) => getClosestSnapPoint(current));
    } else {
      setHeightPercent((current) => {
        const currentIndex = SNAP_POINTS.indexOf(getClosestSnapPoint(current));
        const nextIndex = (currentIndex + 1) % SNAP_POINTS.length;
        return SNAP_POINTS[nextIndex];
      });
    }
  };

  // 정렬 방식에 따라 목록을 다시 배열 (가까운순은 백엔드가 이미 거리순으로 내려주므로 그대로 사용)
  const sortedPlaces =
    sortValue === 'name' ? [...places].sort((a, b) => a.title.localeCompare(b.title)) : places;

  return (
    <div
      ref={panelRef}
      className="place-guide-nearby-panel"
      style={{ height: `${heightPercent}%` }}
    >
      <span
        className="place-guide-nearby-panel__handle"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        aria-hidden="true"
      />

      <div className="place-guide-nearby-panel__content">
        <Dropdown options={SORT_OPTIONS} value={sortValue} onChange={setSortValue} />

        {sortedPlaces.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888888', marginTop: 20 }}>
            주변에 장소가 없습니다.
          </p>
        ) : (
          <ul className="place-guide-nearby-panel__list">
            {sortedPlaces.map((place) => (
              <li key={place.placeId} className="place-guide-nearby-panel__item">
                <button
                  type="button"
                  className="place-guide-nearby-panel__item-button"
                  onClick={() => navigate(`/place-guide/${place.placeId}`)}
                >
                  <p className="place-guide-nearby-panel__item-title">{place.title}</p>
                  <p className="place-guide-nearby-panel__item-subtitle">주소 : {place.subtitle}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default PlaceGuideNearbyPanel;
