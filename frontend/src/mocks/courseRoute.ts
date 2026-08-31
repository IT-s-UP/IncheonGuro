import { mockCourses } from './courseguide';
import type { Course } from './courseguide';

// 4가지 이동수단 탭
export type TransportMode = 'walk' | 'transit' | 'bike' | 'car';

// 탭 버튼에 표시할 한글 라벨
export const TRANSPORT_MODE_LABEL: Record<TransportMode, string> = {
  walk: '도보',
  transit: '대중교통',
  bike: '자전거',
  car: '자차',
};

// 장소(출발지/경유지/도착지) 노드
export interface RoutePlaceNode {
  type: 'place';
  label: string; // '출발지' | '경유지1' | '경유지2' | '도착지'
  name: string;
  address: string;
}

// 장소와 장소 사이의 이동 구간 노드
export interface RouteSegmentNode {
  type: 'segment';
  mode: string; // 세부 이동수단 (도보, 버스, 지하철, 자전거, 자차)
  distance: string; // 예: '350m'
  duration: string; // 예: '5분'
}

export type RouteNode = RoutePlaceNode | RouteSegmentNode;

// 코스 하나가 가진, 이동수단별 경로 전체
export interface CourseRoute {
  courseId: number;
  routes: Record<TransportMode, RouteNode[]>;
}

// 이동수단별로 구간에 쓰이는 세부 수단 이름 (대중교통은 도보→버스→지하철을 섞어서 사용)
const SEGMENT_MODE_BY_TRANSPORT: Record<TransportMode, string[]> = {
  walk: ['도보'],
  transit: ['도보', '버스', '지하철'],
  bike: ['자전거'],
  car: ['자차'],
};

// 이동수단마다 같은 거리라도 걸리는 시간이 다르므로 곱해줄 배수
const DURATION_MULTIPLIER: Record<TransportMode, number> = {
  walk: 1,
  transit: 0.4,
  bike: 0.5,
  car: 0.25,
};

// index, 전체 길이에 따라 '출발지' / '경유지n' / '도착지' 라벨 결정
function buildLabel(index: number, total: number): string {
  if (index === 0) return '출발지';
  if (index === total - 1) return '도착지';
  return `경유지${index}`;
}

// 코스 하나의 places 배열을 기반으로, 특정 이동수단의 전체 경로(장소+구간 번갈아)를 생성
function buildRouteForMode(course: Course, mode: TransportMode): RouteNode[] {
  const nodes: RouteNode[] = [];
  const places = course.places;

  places.forEach((place, idx) => {
    // 장소 노드 추가
    nodes.push({
      type: 'place',
      label: buildLabel(idx, places.length),
      name: place.name,
      address: place.address,
    });

    // 마지막 장소가 아니면, 다음 장소로 가는 이동 구간 노드도 추가
    if (idx < places.length - 1) {
      const segmentModes = SEGMENT_MODE_BY_TRANSPORT[mode];
      const segmentMode = segmentModes[idx % segmentModes.length];
      const baseDistance = 300 + idx * 150;
      const baseDuration = Math.round((5 + idx * 3) * DURATION_MULTIPLIER[mode]);

      nodes.push({
        type: 'segment',
        mode: segmentMode,
        distance: `${baseDistance}m`,
        duration: `${baseDuration}분`,
      });
    }
  });

  return nodes;
}

// 전체 코스(mockCourses) 각각에 대해, 4가지 이동수단 경로를 전부 미리 생성해둠
export const mockCourseRoutes: CourseRoute[] = mockCourses.map((course) => ({
  courseId: course.courseId,
  routes: {
    walk: buildRouteForMode(course, 'walk'),
    transit: buildRouteForMode(course, 'transit'),
    bike: buildRouteForMode(course, 'bike'),
    car: buildRouteForMode(course, 'car'),
  },
}));

// courseId로 해당 코스의 경로 데이터를 찾는 헬퍼 함수
export function getCourseRoute(courseId: number): CourseRoute | undefined {
  return mockCourseRoutes.find((route) => route.courseId === courseId);
}
