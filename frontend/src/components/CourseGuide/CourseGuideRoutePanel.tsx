import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import type { TransportMode } from '@/mocks/courseRoute';
import { getCourseRoute } from '@/mocks/courseRoute';
import CourseGuideRouteDetailList from '@/components/CourseGuide/CourseGuideRouteDetailList';
import './CourseGuideRoutePanel.css';

// 패널이 멈출 수 있는 3단계 높이(px)
const SNAP_POINTS = [40, 160, 480];
const CLICK_THRESHOLD = 5;

interface CourseGuideRoutePanelProps {
  courseId: number; // 어느 코스인지? (URL의 :courseId)
  activeMode: TransportMode; // 어느 이동수단 탭이 선택되어 있는지?
}

// 현재 높이에서 가장 가까운 포인트를 찾은 후 멈춤 -> SNAP_POINTS
function getClosestSnapPoint(current: number): number {
  return SNAP_POINTS.reduce((closest, point) =>
    Math.abs(point - current) < Math.abs(closest - current) ? point : closest,
  );
}

function CourseGuideRoutePanel({ courseId, activeMode }: CourseGuideRoutePanelProps) {
  // 패널의 현재 높이(px)
  const [height, setHeight] = useState(SNAP_POINTS[1]); // 처음 시작하는 높이는 160px
  const dragStartY = useRef(0); // 드래그 시작한 순간의 마우스나 손가락 Y좌표
  const dragStartHeight = useRef(0); // 드래그 시작한 순간의 패널 높이
  const isDragging = useRef(false); // 지금 드래그 중?
  const hasMoved = useRef(false); // 실제로 CLICK_THRESHOLD 이상 움직였나? (클릭 vs 드래그 구분용)

  // courseId, activeMode에 맞는 경로 데이터를 mock에서 조회
  const courseRoute = getCourseRoute(courseId);
  const nodes = courseRoute?.routes[activeMode] ?? [];

  const minHeight = SNAP_POINTS[0]; // 가장 낮은 높이
  const maxHeight = SNAP_POINTS[SNAP_POINTS.length - 1]; // 가장 높은 높이

  // 패널 위의 손잡이를 누르기 시작한 순간
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

  // 패널 위의 손잡이에서 손을 뗀 순간
  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (hasMoved.current) {
      // 드래그였던 경우 -> 가장 가까운 포인트로 이동
      setHeight((current) => getClosestSnapPoint(current));
    } else {
      // 딱 한 번 클릭이었던 경우 -> 다음 단계 (바닥 -> 중간 -> 천장 -> 바닥 ...)
      setHeight((current) => {
        const currentIndex = SNAP_POINTS.indexOf(getClosestSnapPoint(current));
        const nextIndex = (currentIndex + 1) % SNAP_POINTS.length;
        return SNAP_POINTS[nextIndex];
      });
    }
  };

  return (
    <div className="course-guide-route-panel" style={{ height }}>
      <span
        className="course-guide-route-panel__handle"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        aria-hidden="true"
      />
      <div className="course-guide-route-panel__content">
        <CourseGuideRouteDetailList nodes={nodes} />
      </div>
    </div>
  );
}

export default CourseGuideRoutePanel;
