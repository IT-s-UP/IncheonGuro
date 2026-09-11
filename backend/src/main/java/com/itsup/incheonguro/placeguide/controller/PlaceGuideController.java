package com.itsup.incheonguro.placeguide.controller;

import com.itsup.incheonguro.placeguide.dto.PlaceDetailResponse;
import com.itsup.incheonguro.placeguide.dto.PlaceImageResponse;
import com.itsup.incheonguro.placeguide.dto.PlaceSearchResultResponse;
import com.itsup.incheonguro.placeguide.dto.PlaceSummaryResponse;
import com.itsup.incheonguro.placeguide.entity.District;
import com.itsup.incheonguro.placeguide.entity.PlaceCategory;
import com.itsup.incheonguro.placeguide.service.PlaceGuideService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// 장소 안내(검색/필터/상세/북마크) API의 URL을 정의하는 컨트롤러
@RestController
@RequestMapping("/api/placeguide")
@RequiredArgsConstructor
public class PlaceGuideController {

  private final PlaceGuideService placeGuideService;

  // GET /api/placeguide/autocomplete?keyword=검색어
  // 키워드 자동완성 (장소 이름 + 코스 이름)
  @GetMapping("/autocomplete")
  public List<String> getAutocomplete(@RequestParam String keyword) {
    return placeGuideService.getAutocomplete(keyword);
  }

  // GET /api/placeguide/search?keyword=검색어
  // 검색 결과 페이지 조회 (장소 + 코스)
  @GetMapping("/search")
  public PlaceSearchResultResponse getSearchResult(@RequestParam String keyword) {
    return placeGuideService.getSearchResult(keyword);
  }

  // GET /api/placeguide?districts=SEO,JUNG&categories=CAFE
  // 주요 장소 안내 - 구/카테고리 필터 조회 (파라미터 없으면 전체 조회)
  @GetMapping
  public List<PlaceSummaryResponse> getPlaces(
      @RequestParam(required = false) List<District> districts,
      @RequestParam(required = false) List<PlaceCategory> categories) {
    return placeGuideService.getPlaces(districts, categories);
  }

  // GET /api/placeguide/tags?tagName=태그이름
  // 태그 검색 결과 조회 (태그 클릭 시)
  @GetMapping("/tags")
  public List<PlaceSummaryResponse> getPlacesByTag(@RequestParam String tagName) {
    return placeGuideService.getPlacesByTag(tagName);
  }

  // GET /api/placeguide/near-me?district=SEO
  // 내 주변 장소 조회 (좌표 미사용, district 기준)
  @GetMapping("/near-me")
  public List<PlaceSummaryResponse> getPlacesNearMe(@RequestParam District district) {
    return placeGuideService.getPlacesNearMe(district);
  }

  // GET /api/placeguide/bookmarks
  // 북마크 목록 조회
  @GetMapping("/bookmarks")
  public List<PlaceSummaryResponse> getBookmarkedPlaces(@AuthenticationPrincipal Jwt jwt) {
    Long userId = Long.valueOf(jwt.getSubject());
    return placeGuideService.getBookmarkedPlaces(userId);
  }

  // GET /api/placeguide/{placeId}
  // 장소 상세 조회
  @GetMapping("/{placeId}")
  public PlaceDetailResponse getPlaceDetail(
      @PathVariable Long placeId,
      @AuthenticationPrincipal Jwt jwt) {
    Long userId = Long.valueOf(jwt.getSubject());
    return placeGuideService.getPlaceDetail(placeId, userId);
  }

  // GET /api/placeguide/{placeId}/images
  // 장소 상세 이미지 목록 조회
  @GetMapping("/{placeId}/images")
  public List<PlaceImageResponse> getPlaceImages(@PathVariable Long placeId) {
    return placeGuideService.getPlaceImages(placeId);
  }

  // GET /api/placeguide/{placeId}/nearby
  // 해당 장소의 주변 장소 조회
  @GetMapping("/{placeId}/nearby")
  public List<PlaceSummaryResponse> getNearbyPlaces(@PathVariable Long placeId) {
    return placeGuideService.getNearbyPlaces(placeId);
  }

  // POST /api/placeguide/{placeId}/bookmark
  // 북마크 등록
  @PostMapping("/{placeId}/bookmark")
  public void addBookmark(
      @PathVariable Long placeId,
      @AuthenticationPrincipal Jwt jwt) {
    Long userId = Long.valueOf(jwt.getSubject());
    placeGuideService.addBookmark(placeId, userId);
  }

  // DELETE /api/placeguide/{placeId}/bookmark
  // 북마크 해제
  @DeleteMapping("/{placeId}/bookmark")
  public void removeBookmark(
      @PathVariable Long placeId,
      @AuthenticationPrincipal Jwt jwt) {
    Long userId = Long.valueOf(jwt.getSubject());
    placeGuideService.removeBookmark(placeId, userId);
  }
}
