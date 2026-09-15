// src/api/courseGuide.ts
// 코스 안내 페이지 전용 API 호출 함수 모음 (fetch 기반, placeGuide.ts와 동일한 패턴)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // '/api'

function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

async function request<T>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'DELETE'; body?: unknown } = {},
): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status} ${path}`);
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// ==========================================
// 타입 정의 - 백엔드 DTO와 1:1로 맞춤
// ==========================================

// CourseSummaryResponse.java 와 대응
// 주의: courseId는 우리 DB의 숫자 PK가 아니라 관광공사 contentId(문자열)
export interface CourseSummary {
  courseId: string;
  name: string;
  description: string; // 지금은 관광공사 주소(addr1)가 채워져서 옴
  isBookmarked: boolean;
}

// RouteNodeResponse.java 와 대응 - mock courseRoute.ts의 RoutePlaceNode/RouteSegmentNode와 동일한 형태
export interface RoutePlaceNode {
  type: 'place';
  label: string; // '출발지' | '경유지1' | ... | '도착지'
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface RouteSegmentNode {
  type: 'segment';
  mode: string; // '도보' | '대중교통' | '자전거' | '자차'
  distance: string; // 예: '1.4km', '정보 없음'
  duration: string; // 예: '20분', '정보 없음'
}

export type RouteNode = RoutePlaceNode | RouteSegmentNode;

// 이동수단 4종. 백엔드 응답의 routes 객체 키와 동일 (소문자)
export type TransportMode = 'walk' | 'transit' | 'bike' | 'car';

// CourseDetailResponse.java 와 대응
export interface CourseDetail {
  courseId: string;
  name: string;
  isBookmarked: boolean;
  routes: Record<TransportMode, RouteNode[]>;
}

export interface Place {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

// ==========================================
// API 함수
// ==========================================

// GET /api/courseguide/recommended - 오늘의 추천 코스 5개 (로그인 불필요, 로그인 시 isBookmarked 정확)
export function getRecommendedCourses() {
  return request<CourseSummary[]>('/courseguide/recommended');
}

// GET /api/courseguide?keyword= - 코스 목록 조회 (keyword 없으면 인천 전체, 있으면 검색)
export function getCourses(keyword?: string) {
  const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
  return request<CourseSummary[]>(`/courseguide${query}`);
}

// GET /api/courseguide/{courseId} - 코스 상세(이동수단별 경로 포함) 조회
export function getCourseDetail(courseId: string) {
  return request<CourseDetail>(`/courseguide/${courseId}`);
}

// POST /api/courseguide/{courseId}/bookmark - 북마크 등록 (로그인 필요)
export function addBookmark(courseId: string) {
  return request<void>(`/courseguide/${courseId}/bookmark`, { method: 'POST' });
}

// DELETE /api/courseguide/{courseId}/bookmark - 북마크 해제 (로그인 필요)
export function removeBookmark(courseId: string) {
  return request<void>(`/courseguide/${courseId}/bookmark`, { method: 'DELETE' });
}
