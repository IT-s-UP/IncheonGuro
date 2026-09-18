// src/api/placeGuide.ts
// 장소 안내 페이지 전용 API 호출 함수 모음

import { getAccessToken } from '@/auth/api';
import type { CourseSummary } from './courseGuide';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// =========================================================
// 공통 API 요청
// =========================================================

async function request<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'DELETE';
    body?: unknown;
  } = {},
): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',

    headers: {
      'Content-Type': 'application/json',

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },

    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status} ${path}`);
  }

  const text = await response.text();

  return (text ? JSON.parse(text) : undefined) as T;
}

// =========================================================
// 타입 정의
// =========================================================

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

export type PlaceCategory =
  'ATTRACTION' | 'CULTURE' | 'LEISURE' | 'CAFE' | 'RESTAURANT' | 'LODGING' | 'SHOPPING';

// =========================================================
// 장소 요약
// =========================================================

export interface PlaceSummary {
  /*
   * 한국관광공사 contentId
   */
  placeId: string;

  title: string;

  subtitle: string;

  district: District | null;

  category: PlaceCategory;

  latitude: number | null;

  longitude: number | null;

  imageUrl: string;
}

// =========================================================
// 장소 상세
// =========================================================

export interface PlaceDetail {
  placeId: string;

  title: string;

  subtitle: string;

  description: string;

  district: District | null;

  category: PlaceCategory;

  bookmarked: boolean;

  tags: string[];

  latitude: number | null;

  longitude: number | null;

  usageTime: string;

  restDate: string;

  parking: string;

  infoCenter: string;

  extraInfoTexts: string[];
}

// =========================================================
// 장소 이미지
// =========================================================

export interface PlaceImage {
  imageUrl: string;
}

// =========================================================
// 검색 결과
// =========================================================

export interface PlaceSearchResult {
  places: PlaceSummary[];

  courses: CourseSummary[];
}

// =========================================================
// 장소 목록
// =========================================================

export function getPlaces(districts?: District[], categories?: PlaceCategory[]) {
  const params = new URLSearchParams();

  // =======================================================
  // 지역
  // =======================================================

  if (districts && districts.length > 0) {
    params.set('districts', districts.join(','));
  }

  // =======================================================
  // 장소 유형
  // =======================================================

  if (categories && categories.length > 0) {
    /*
     * 프론트에서는
     *
     * 음식점 = 하나의 필터
     *
     * 로 보여주지만,
     *
     * 실제 데이터에서는
     *
     * CAFE
     * RESTAURANT
     *
     * 두 종류를 따로 사용함.
     *
     * 따라서 음식점 필터가 선택되면
     * 백엔드에는 두 값을 모두 전달한다.
     */

    const normalizedCategories = new Set<PlaceCategory>();

    for (const category of categories) {
      if (category === 'RESTAURANT') {
        normalizedCategories.add('CAFE');

        normalizedCategories.add('RESTAURANT');
      } else {
        normalizedCategories.add(category);
      }
    }

    params.set('categories', Array.from(normalizedCategories).join(','));
  }

  const query = params.toString() ? `?${params.toString()}` : '';

  return request<PlaceSummary[]>(`/placeguide${query}`);
}

// =========================================================
// 내 주변 장소
// =========================================================

export function getPlacesNearMe(latitude: number, longitude: number) {
  return request<PlaceSummary[]>(`/placeguide/near-me?latitude=${latitude}&longitude=${longitude}`);
}

// =========================================================
// 북마크
// =========================================================

export function getBookmarkedPlaces() {
  return request<PlaceSummary[]>('/placeguide/bookmarks');
}

// =========================================================
// 자동완성
// =========================================================

export function getAutocomplete(keyword: string) {
  return request<string[]>(`/placeguide/autocomplete?keyword=${encodeURIComponent(keyword)}`);
}

// =========================================================
// 검색
// =========================================================

export function getSearchResult(keyword: string) {
  return request<PlaceSearchResult>(`/placeguide/search?keyword=${encodeURIComponent(keyword)}`);
}

// =========================================================
// 장소 상세
// =========================================================

export function getPlaceDetail(placeId: string) {
  return request<PlaceDetail>(`/placeguide/${placeId}`);
}

// =========================================================
// 장소 이미지
// =========================================================

export function getPlaceImages(placeId: string) {
  return request<PlaceImage[]>(`/placeguide/${placeId}/images`);
}

// =========================================================
// 주변 장소
// =========================================================

export function getNearbyPlaces(placeId: string) {
  return request<PlaceSummary[]>(`/placeguide/${placeId}/nearby`);
}

// =========================================================
// 북마크 등록
// =========================================================

export function addBookmark(placeId: string) {
  return request<void>(`/placeguide/${placeId}/bookmark`, {
    method: 'POST',
  });
}

// =========================================================
// 북마크 삭제
// =========================================================

export function removeBookmark(placeId: string) {
  return request<void>(`/placeguide/${placeId}/bookmark`, {
    method: 'DELETE',
  });
}
