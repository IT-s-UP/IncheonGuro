import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import Dropdown from '@/components/Dropdown/Dropdown';
import type { Place } from '@/mocks/place';
import './PlaceGuideNearbyPanel.css';

// 패널이 멈출 수 있는 3단계 높이(px)
const SNAP_POINTS = [80, 240, 400];
const CLICK_THRESHOLD = 5;

const SORT_OPTIONS = [
  { label: '가까운순', value: 'near' },
  { label: '이름순', value: 'name' },
];

interface PlaceGuideNearbyPanelProps {
  places: Place[];
}

function getClosestSnapPoint(current: number): number {
  return SNAP_POINTS.reduce((closest, point) =>
    Math.abs(point - current) < Math.abs(closest - current) ? point : closest,
  );
}

function PlaceGuideNearbyPanel({ places }: PlaceGuideNearbyPanelProps) {
  const [height, setHeight] = useState(SNAP_POINTS[1]);
  const [sortValue, setSortValue] = useState('near');

  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const isDragging = useRef(false);
  const hasMoved = useRef(false);

  const minHeight = SNAP_POINTS[0];
  const maxHeight = SNAP_POINTS[SNAP_POINTS.length - 1];

  const handlePointerDown = (event: PointerEvent<HTMLSpanElement>) => {
    isDragging.current = true;
    hasMoved.current = false;
    dragStartY.current = event.clientY;
    dragStartHeight.current = height;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (!isDragging.current) return;

    const delta = dragStartY.current - event.clientY;

    if (Math.abs(delta) > CLICK_THRESHOLD) {
      hasMoved.current = true;
    }

    const nextHeight = dragStartHeight.current + delta;
    const clamped = Math.min(maxHeight, Math.max(minHeight, nextHeight));
    setHeight(clamped);
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (hasMoved.current) {
      setHeight((current) => getClosestSnapPoint(current));
    } else {
      setHeight((current) => {
        const currentIndex = SNAP_POINTS.indexOf(getClosestSnapPoint(current));
        const nextIndex = (currentIndex + 1) % SNAP_POINTS.length;
        return SNAP_POINTS[nextIndex];
      });
    }
  };

  return (
    <div className="place-guide-nearby-panel" style={{ height }}>
      <span
        className="place-guide-nearby-panel__handle"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        aria-hidden="true"
      />

      <div className="place-guide-nearby-panel__content">
        <Dropdown options={SORT_OPTIONS} value={sortValue} onChange={setSortValue} />

        <ul className="place-guide-nearby-panel__list">
          {places.map((place) => (
            <li key={place.id} className="place-guide-nearby-panel__item">
              <p className="place-guide-nearby-panel__item-title">{place.title}</p>
              <p className="place-guide-nearby-panel__item-subtitle">주소 : {place.subtitle}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PlaceGuideNearbyPanel;
