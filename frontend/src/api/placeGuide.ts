// src/api/placeGuide.ts
// 장소 안내 페이지 전용 API 호출 함수 모음 (fetch 기반)

import { getAccessToken } from '@/auth/api';
import type { CourseSummary } from './courseGuide';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // '/api'

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

// 백엔드 District enum 값과 정확히 동일해야 함
export type District =
  | 'JEMULPO'
  | 'YEONGJONG'
  | 'SEOHAE'
  | 'GEOMDAN'
  | 'GYEYANG'
  | 'BUPYEONG'
  | 'MICHUHOL'
  | 'NAMDONG'
  | 'YEONSU'
  | 'GANGHWA'
  | 'ONGJIN';

// 백엔드 PlaceCategory enum 값과 정확히 동일해야 함
export type PlaceCategory = 'ATTRACTION' | 'CAFE' | 'RESTAURANT' | 'LODGING' | 'SHOPPING';

// PlaceSummaryResponse.java 와 대응
export interface PlaceSummary {
  placeId: string; // 관광공사 contentId - 숫자 아님, 문자열!
  title: string;
  subtitle: string; // 주소
  district: District | null; // 강화군/옹진군 등 8개 구 밖 지역이면 null
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  imageUrl: string;
}

// PlaceDetailResponse.java 와 대응
export interface PlaceDetail {
  placeId: string;
  title: string;
  subtitle: string;
  description: string;
  district: District | null;
  category: PlaceCategory;
  bookmarked: boolean;
  tags: string[];
  latitude: number;
  longitude: number;
  usageTime: string; // 추가 - 이용시간
  restDate: string; // 추가 - 쉬는날
  parking: string; // 추가 - 주차시설
  infoCenter: string; // 추가 - 문의 및 안내
  extraInfoTexts: string[];
}

export interface PlaceImage {
  imageUrl: string;
}

// CourseSummary는 courseGuide.ts로 정의를 옮김 (코스가 관광공사 API 기반으로 전환되면서
// courseId가 number -> string(contentId)으로 바뀌었고, isBookmarked 필드도 추가됨.
// 정의를 한 곳에 모아서 courseGuide.ts와 placeGuide.ts가 항상 같은 타입을 쓰도록 함)
export interface PlaceSearchResult {
  places: PlaceSummary[];
  courses: CourseSummary[];
}

// ==========================================
// API 함수
// ==========================================

// GET /api/placeguide?districts=...&categories=... - 주요 장소 안내 필터 조회
export function getPlaces(districts?: District[], categories?: PlaceCategory[]) {
  const params = new URLSearchParams();
  if (districts && districts.length > 0) params.set('districts', districts.join(','));
  if (categories && categories.length > 0) params.set('categories', categories.join(','));
  const query = params.toString() ? `?${params.toString()}` : '';
  return request<PlaceSummary[]>(`/placeguide${query}`);
}

// GET /api/placeguide/near-me?latitude=...&longitude=... - 내 주변 장소 조회 (좌표 기반)
export function getPlacesNearMe(latitude: number, longitude: number) {
  return request<PlaceSummary[]>(`/placeguide/near-me?latitude=${latitude}&longitude=${longitude}`);
}

// GET /api/placeguide/bookmarks - 북마크 목록 조회 (로그인 필요)
export function getBookmarkedPlaces() {
  return request<PlaceSummary[]>('/placeguide/bookmarks');
}

// GET /api/placeguide/autocomplete?keyword= - 키워드 자동완성
export function getAutocomplete(keyword: string) {
  return request<string[]>(`/placeguide/autocomplete?keyword=${encodeURIComponent(keyword)}`);
}

// GET /api/placeguide/search?keyword= - 검색 결과 조회 (장소 + 코스)
export function getSearchResult(keyword: string) {
  return request<PlaceSearchResult>(`/placeguide/search?keyword=${encodeURIComponent(keyword)}`);
}

// GET /api/placeguide/{placeId} - 장소 상세 조회
export function getPlaceDetail(placeId: string) {
  return request<PlaceDetail>(`/placeguide/${placeId}`);
}

// GET /api/placeguide/{placeId}/images - 장소 이미지 목록 조회
export function getPlaceImages(placeId: string) {
  return request<PlaceImage[]>(`/placeguide/${placeId}/images`);
}

// GET /api/placeguide/{placeId}/nearby - 해당 장소의 주변 장소 조회
export function getNearbyPlaces(placeId: string) {
  return request<PlaceSummary[]>(`/placeguide/${placeId}/nearby`);
}

// POST /api/placeguide/{placeId}/bookmark - 북마크 등록 (로그인 필요)
export function addBookmark(placeId: string) {
  return request<void>(`/placeguide/${placeId}/bookmark`, { method: 'POST' });
}

// DELETE /api/placeguide/{placeId}/bookmark - 북마크 해제 (로그인 필요)
export function removeBookmark(placeId: string) {
  return request<void>(`/placeguide/${placeId}/bookmark`, { method: 'DELETE' });
}
