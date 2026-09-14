import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { X } from 'lucide-react';
import './PlaceGuideDetailImage.css';

const SNAP_POINTS = [40, 300, 560];
const CLICK_THRESHOLD = 5;

interface PlaceGuideDetailImageProps {
  imageUrls: string[];
  onClose: () => void;
}

function getClosestSnapPoint(current: number): number {
  return SNAP_POINTS.reduce((closest, point) =>
    Math.abs(point - current) < Math.abs(closest - current) ? point : closest,
  );
}

function PlaceGuideDetailImage({ imageUrls, onClose }: PlaceGuideDetailImageProps) {
  const [height, setHeight] = useState(SNAP_POINTS[1]);

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
    <div className="place-guide-detail-image" style={{ height }}>
      <button
        type="button"
        className="place-guide-detail-image__close-btn"
        onClick={onClose}
        aria-label="닫기"
      >
        <X size={20} color="#000000" />
      </button>

      <span
        className="place-guide-detail-image__handle"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        aria-hidden="true"
      />

      <div className="place-guide-detail-image__content">
        {imageUrls.length === 0 ? (
          <div className="place-guide-detail-image__item">이미지가 없습니다.</div>
        ) : (
          imageUrls.map((url, index) => (
            <div key={url} className="place-guide-detail-image__item">
              <img
                src={url}
                alt={`장소 이미지 ${index + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PlaceGuideDetailImage;
