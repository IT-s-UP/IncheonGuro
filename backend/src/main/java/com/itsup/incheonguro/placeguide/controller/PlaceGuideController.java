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

// 장소 안내 API
@RestController
@RequestMapping("/api/placeguide")
@RequiredArgsConstructor
public class PlaceGuideController {

    private final PlaceGuideService placeGuideService;

    /*
     * GET /api/placeguide/autocomplete?keyword=검색어
     */
    @GetMapping("/autocomplete")
    public List<String> getAutocomplete(
            @RequestParam String keyword) {

        return placeGuideService.getAutocomplete(keyword);
    }

    /*
     * GET /api/placeguide/search?keyword=검색어
     */
    @GetMapping("/search")
    public PlaceSearchResultResponse getSearchResult(
            @RequestParam String keyword) {

        return placeGuideService.getSearchResult(keyword);
    }

    /*
     * GET /api/placeguide
     *
     * 전체 조회:
     * /api/placeguide
     *
     * 지역 필터:
     * /api/placeguide?districts=JEMULPO,SEOHAE
     *
     * 장소 유형 필터:
     * /api/placeguide?categories=ATTRACTION,LODGING
     *
     * 지역 + 장소 유형:
     * /api/placeguide?districts=JEMULPO&categories=ATTRACTION
     */
    @GetMapping
    public List<PlaceSummaryResponse> getPlaces(
            @RequestParam(required = false) List<District> districts,
            @RequestParam(required = false) List<PlaceCategory> categories) {

        return placeGuideService.getPlaces(
                districts,
                categories);
    }

    /*
     * GET /api/placeguide/near-me
     */
    @GetMapping("/near-me")
    public List<PlaceSummaryResponse> getPlacesNearMe(
            @RequestParam double latitude,
            @RequestParam double longitude) {

        return placeGuideService.getPlacesNearMe(
                latitude,
                longitude);
    }

    /*
     * GET /api/placeguide/bookmarks
     *
     * 로그인하지 않은 경우 401 반환
     */
    @GetMapping("/bookmarks")
    public List<PlaceSummaryResponse> getBookmarkedPlaces(
            @AuthenticationPrincipal Jwt jwt) {

        if (jwt == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED);
        }

        Long userId = Long.valueOf(
                jwt.getSubject());

        return placeGuideService.getBookmarkedPlaces(
                userId);
    }

    /*
     * GET /api/placeguide/{contentId}
     */
    @GetMapping("/{contentId}")
    public PlaceDetailResponse getPlaceDetail(
            @PathVariable String contentId,
            @AuthenticationPrincipal Jwt jwt) {

        Long userId = (jwt != null)
                ? Long.valueOf(jwt.getSubject())
                : null;

        return placeGuideService.getPlaceDetail(
                contentId,
                userId);
    }

    /*
     * GET /api/placeguide/{contentId}/images
     */
    @GetMapping("/{contentId}/images")
    public List<PlaceImageResponse> getPlaceImages(
            @PathVariable String contentId) {

        return placeGuideService.getPlaceImages(
                contentId);
    }

    /*
     * GET /api/placeguide/{contentId}/nearby
     */
    @GetMapping("/{contentId}/nearby")
    public List<PlaceSummaryResponse> getNearbyPlaces(
            @PathVariable String contentId) {

        return placeGuideService.getNearbyPlaces(
                contentId);
    }

    /*
     * POST /api/placeguide/{contentId}/bookmark
     *
     * 로그인 필요
     */
    @PostMapping("/{contentId}/bookmark")
    public void addBookmark(
            @PathVariable String contentId,
            @AuthenticationPrincipal Jwt jwt) {

        if (jwt == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED);
        }

        Long userId = Long.valueOf(
                jwt.getSubject());

        placeGuideService.addBookmark(
                contentId,
                userId);
    }

    /*
     * DELETE /api/placeguide/{contentId}/bookmark
     *
     * 로그인 필요
     */
    @DeleteMapping("/{contentId}/bookmark")
    public void removeBookmark(
            @PathVariable String contentId,
            @AuthenticationPrincipal Jwt jwt) {

        if (jwt == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED);
        }

        Long userId = Long.valueOf(
                jwt.getSubject());

        placeGuideService.removeBookmark(
                contentId,
                userId);
    }
}
