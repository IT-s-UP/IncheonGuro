import { useLayoutEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import type { RouteNode } from '@/mocks/courseRoute';
import './CourseGuideRouteDetailList.css';

interface CourseGuideRouteDetailListProps {
  nodes: RouteNode[];
}

function CourseGuideRouteDetailList({ nodes }: CourseGuideRouteDetailListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const firstMarkerRef = useRef<HTMLSpanElement>(null);
  const lastMarkerRef = useRef<HTMLSpanElement>(null);
  const [line, setLine] = useState({ top: 0, height: 0 });

  useLayoutEffect(() => {
    if (!listRef.current || !firstMarkerRef.current || !lastMarkerRef.current) return;

    const listTop = listRef.current.getBoundingClientRect().top;
    const firstRect = firstMarkerRef.current.getBoundingClientRect();
    const lastRect = lastMarkerRef.current.getBoundingClientRect();

    const top = firstRect.top + firstRect.height / 2 - listTop;
    const bottom = lastRect.top + lastRect.height / 2 - listTop;

    setLine({ top, height: bottom - top });
  }, [nodes]);

  return (
    <ul ref={listRef} className="course-guide-route-detail-list">
      <div className="route-detail-line" style={{ top: line.top, height: line.height }} />

      {nodes.map((node, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === nodes.length - 1;

        // 장소(출발지/경유지/도착지) 노드인 경우
        if (node.type === 'place') {
          return (
            <li key={`place-${idx}`} className="route-detail-item route-detail-item--place">
              <div className="route-detail-marker-area">
                <span
                  ref={isFirst ? firstMarkerRef : isLast ? lastMarkerRef : undefined}
                  className="route-detail-marker route-detail-marker--place"
                />
              </div>
              <div className="route-detail-text">
                <p className="route-detail-label">{node.label}</p>
                <p className="route-detail-address">
                  {node.name} · {node.address}
                </p>
              </div>
              <button className="route-detail-more" aria-label="더보기">
                <MoreHorizontal size={18} />
              </button>
            </li>
          );
        }

        // 이동구간(도보/버스/자전거 등) 노드인 경우
        return (
          <li key={`segment-${idx}`} className="route-detail-item route-detail-item--segment">
            <div className="route-detail-marker-area">
              <span className="route-detail-marker route-detail-marker--segment" />
            </div>
            <p className="route-detail-segment-text">
              {node.mode} · {node.distance}, {node.duration} 소요
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export default CourseGuideRouteDetailList;
