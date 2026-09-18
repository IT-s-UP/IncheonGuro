package com.itsup.incheonguro.placeguide.controller;

import com.itsup.incheonguro.placeguide.dto.PlaceDetailResponse;
import com.itsup.incheonguro.placeguide.dto.PlaceImageResponse;
import com.itsup.incheonguro.placeguide.dto.PlaceSearchResultResponse;
import com.itsup.incheonguro.placeguide.dto.PlaceSummaryResponse;
import com.itsup.incheonguro.placeguide.entity.District;
import com.itsup.incheonguro.placeguide.entity.PlaceCategory;
import com.itsup.incheonguro.placeguide.service.PlaceGuideService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

// 장소 안내(검색/필터/상세/북마크) API의 URL을 정의하는 컨트롤러
// 장소 데이터는 한국관광공사 API에서 실시간으로 조회하며, 북마크만 우리 DB에 저장함
@RestController
@RequestMapping("/api/placeguide")
@RequiredArgsConstructor
public class PlaceGuideController {

  private final PlaceGuideService placeGuideService;

  // GET /api/placeguide/autocomplete?keyword=검색어
  @GetMapping("/autocomplete")
  public List<String> getAutocomplete(@RequestParam String keyword) {
    return placeGuideService.getAutocomplete(keyword);
  }

  // GET /api/placeguide/search?keyword=검색어
  @GetMapping("/search")
  public PlaceSearchResultResponse getSearchResult(@RequestParam String keyword) {
    return placeGuideService.getSearchResult(keyword);
  }

  // GET /api/placeguide?districts=SEO,JUNG&categories=CAFE
  @GetMapping
  public List<PlaceSummaryResponse> getPlaces(
      @RequestParam(required = false) List<District> districts,
      @RequestParam(required = false) List<PlaceCategory> categories) {
    return placeGuideService.getPlaces(districts, categories);
  }

  // GET /api/placeguide/near-me?latitude=37.xxx&longitude=126.xxx
  // 프론트에서 navigator.geolocation으로 얻은 사용자의 실제 좌표를 그대로 넘겨받음
  @GetMapping("/near-me")
  public List<PlaceSummaryResponse> getPlacesNearMe(
      @RequestParam double latitude,
      @RequestParam double longitude) {
    return placeGuideService.getPlacesNearMe(latitude, longitude);
  }

  // GET /api/placeguide/bookmarks
  @GetMapping("/bookmarks")
  public List<PlaceSummaryResponse> getBookmarkedPlaces(@AuthenticationPrincipal Jwt jwt) {
    if (jwt == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    Long userId = Long.valueOf(jwt.getSubject());
    return placeGuideService.getBookmarkedPlaces(userId);
  }

  // GET /api/placeguide/{contentId}
  @GetMapping("/{contentId}")
  public PlaceDetailResponse getPlaceDetail(
      @PathVariable String contentId,
      @AuthenticationPrincipal Jwt jwt) {
    Long userId = (jwt != null) ? Long.valueOf(jwt.getSubject()) : null;
    return placeGuideService.getPlaceDetail(contentId, userId);
  }

  // GET /api/placeguide/{contentId}/images
  @GetMapping("/{contentId}/images")
  public List<PlaceImageResponse> getPlaceImages(@PathVariable String contentId) {
    return placeGuideService.getPlaceImages(contentId);
  }

  // GET /api/placeguide/{contentId}/nearby
  @GetMapping("/{contentId}/nearby")
  public List<PlaceSummaryResponse> getNearbyPlaces(@PathVariable String contentId) {
    return placeGuideService.getNearbyPlaces(contentId);
  }

  // POST /api/placeguide/{contentId}/bookmark
  @PostMapping("/{contentId}/bookmark")
  public void addBookmark(
      @PathVariable String contentId,
      @AuthenticationPrincipal Jwt jwt) {
    Long userId = Long.valueOf(jwt.getSubject());
    placeGuideService.addBookmark(contentId, userId);
  }

  // DELETE /api/placeguide/{contentId}/bookmark
  @DeleteMapping("/{contentId}/bookmark")
  public void removeBookmark(
      @PathVariable String contentId,
      @AuthenticationPrincipal Jwt jwt) {
    Long userId = Long.valueOf(jwt.getSubject());
    placeGuideService.removeBookmark(contentId, userId);
  }
}
