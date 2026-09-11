package com.itsup.incheonguro.placeguide.service;

import com.itsup.incheonguro.courseguide.dto.CourseSummaryResponse;
import com.itsup.incheonguro.courseguide.repository.CourseRepository;
import com.itsup.incheonguro.placeguide.dto.PlaceDetailResponse;
import com.itsup.incheonguro.placeguide.dto.PlaceImageResponse;
import com.itsup.incheonguro.placeguide.dto.PlaceSearchResultResponse;
import com.itsup.incheonguro.placeguide.dto.PlaceSummaryResponse;
import com.itsup.incheonguro.placeguide.entity.District;
import com.itsup.incheonguro.placeguide.entity.Place;
import com.itsup.incheonguro.placeguide.entity.PlaceBookmark;
import com.itsup.incheonguro.placeguide.entity.PlaceCategory;
import com.itsup.incheonguro.placeguide.entity.PlaceTag;
import com.itsup.incheonguro.placeguide.repository.PlaceBookmarkRepository;
import com.itsup.incheonguro.placeguide.repository.PlaceImageRepository;
import com.itsup.incheonguro.placeguide.repository.PlaceRepository;
import com.itsup.incheonguro.placeguide.repository.PlaceTagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaceGuideService {

  private final PlaceRepository placeRepository;
  private final PlaceImageRepository placeImageRepository;
  private final PlaceTagRepository placeTagRepository;
  private final PlaceBookmarkRepository placeBookmarkRepository;

  // 다른 도메인(courseguide) 참조 - 통합 검색 결과에서 코스도 같이 보여줘야 하기 때문
  private final CourseRepository courseRepository;

  // 주요 장소 안내 - 필터(구/카테고리) 조회. 파라미터가 비어있으면(null 또는 empty) 그 조건은 무시하고 전체 조회
  public List<PlaceSummaryResponse> getPlaces(List<District> districts, List<PlaceCategory> categories) {
    // Repository의 findByFilters는 "조건 없음"을 null로만 인식하므로, 빈 리스트는 null로 변환해서 넘김
    List<District> districtCondition = (districts == null || districts.isEmpty()) ? null : districts;
    List<PlaceCategory> categoryCondition = (categories == null || categories.isEmpty()) ? null : categories;

    return placeRepository.findByFilters(districtCondition, categoryCondition).stream()
        .map(PlaceSummaryResponse::new)
        .collect(Collectors.toList());
  }

  // 태그 검색 결과 조회 - 태그 클릭 시 사용
  public List<PlaceSummaryResponse> getPlacesByTag(String tagName) {
    return placeRepository.findByTagName(tagName).stream()
        .map(PlaceSummaryResponse::new)
        .collect(Collectors.toList());
  }

  // 키워드 자동완성 - 장소 이름 + 코스 이름을 합쳐서 문자열 목록으로 반환
  public List<String> getAutocomplete(String keyword) {
    List<String> placeTitles = placeRepository.findByTitleContaining(keyword).stream()
        .map(Place::getTitle)
        .collect(Collectors.toList());

    List<String> courseNames = courseRepository.findByNameContainingOrDescriptionContaining(keyword, keyword)
        .stream()
        .map(course -> course.getName())
        .collect(Collectors.toList());

    // 장소 이름 목록 뒤에 코스 이름 목록을 이어붙여서 하나의 리스트로 반환
    List<String> suggestions = new java.util.ArrayList<>(placeTitles);
    suggestions.addAll(courseNames);
    return suggestions;
  }

  // 검색 결과 페이지 조회 - 장소와 코스를 함께 검색해서 반환
  public PlaceSearchResultResponse getSearchResult(String keyword) {
    List<PlaceSummaryResponse> places = placeRepository.findByTitleContaining(keyword).stream()
        .map(PlaceSummaryResponse::new)
        .collect(Collectors.toList());

    List<CourseSummaryResponse> courses = courseRepository
        .findByNameContainingOrDescriptionContaining(keyword, keyword).stream()
        .map(CourseSummaryResponse::new)
        .collect(Collectors.toList());

    return new PlaceSearchResultResponse(places, courses);
  }

  // 장소 상세 조회
  public PlaceDetailResponse getPlaceDetail(Long placeId, Long userId) {
    Place place = placeRepository.findById(placeId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 장소입니다. id=" + placeId));

    // userId가 있고, 그 사용자가 이 장소를 북마크했으면 true
    boolean isBookmarked = userId != null
        && placeBookmarkRepository.existsByUserIdAndPlaceId(userId, placeId);

    List<String> tags = placeTagRepository.findByPlaceId(placeId).stream()
        .map(PlaceTag::getTagName)
        .collect(Collectors.toList());

    return new PlaceDetailResponse(
        place.getId(),
        place.getTitle(),
        place.getSubtitle(),
        place.getDescription(),
        isBookmarked,
        tags);
  }

  // 장소 상세 이미지 목록 조회
  public List<PlaceImageResponse> getPlaceImages(Long placeId) {
    return placeImageRepository.findByPlaceIdOrderByOrderIndexAsc(placeId).stream()
        .map(PlaceImageResponse::new)
        .collect(Collectors.toList());
  }

  // 해당 장소의 주변 장소 조회 - 같은 구에 속한 다른 장소 중 최대 4개 (자기 자신 제외)
  public List<PlaceSummaryResponse> getNearbyPlaces(Long placeId) {
    Place place = placeRepository.findById(placeId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 장소입니다. id=" + placeId));

    return placeRepository.findByDistrictAndIdNot(place.getDistrict(), placeId).stream()
        .limit(4)
        .map(PlaceSummaryResponse::new)
        .collect(Collectors.toList());
  }

  // 내 주변 장소 조회 - 특정 구에 속한 장소 전체 (좌표 미사용, district 기준)
  public List<PlaceSummaryResponse> getPlacesNearMe(District district) {
    return getPlaces(List.of(district), null);
  }

  // 북마크 목록 조회
  public List<PlaceSummaryResponse> getBookmarkedPlaces(Long userId) {
    return placeBookmarkRepository.findByUserId(userId).stream()
        .map(PlaceBookmark::getPlace)
        .map(PlaceSummaryResponse::new)
        .collect(Collectors.toList());
  }

  // 북마크 등록
  @Transactional
  public void addBookmark(Long placeId, Long userId) {
    if (placeBookmarkRepository.existsByUserIdAndPlaceId(userId, placeId)) {
      return; // 이미 북마크되어 있으면 아무것도 X
    }

    Place place = placeRepository.findById(placeId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 장소입니다. id=" + placeId));

    PlaceBookmark bookmark = new PlaceBookmark(userId, place);
    placeBookmarkRepository.save(bookmark);
  }

  // 북마크 해제
  @Transactional
  public void removeBookmark(Long placeId, Long userId) {
    placeBookmarkRepository.findByUserIdAndPlaceId(userId, placeId)
        .ifPresent(placeBookmarkRepository::delete);
  }
}
