package com.itsup.incheonguro.placeguide.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsup.incheonguro.courseguide.dto.CourseSummaryResponse;
import com.itsup.incheonguro.courseguide.repository.CourseRepository;
import com.itsup.incheonguro.placeguide.dto.*;
import com.itsup.incheonguro.placeguide.entity.District;
import com.itsup.incheonguro.placeguide.entity.PlaceBookmark;
import com.itsup.incheonguro.placeguide.entity.PlaceCategory;
import com.itsup.incheonguro.placeguide.repository.PlaceBookmarkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlaceGuideService {

  // 한국관광공사 국문 관광정보 서비스(KorService2)의 기본 주소
  private static final String BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
  private static final String INCHEON_REGN_CD = "28";

  // 기본 반경 - "내 주변" 조회 시 사용 (미터 단위)
  private static final int DEFAULT_RADIUS_METERS = 2000;

  private final RestTemplate restTemplate;
  private final ObjectMapper objectMapper;
  private final PlaceBookmarkRepository placeBookmarkRepository;
  private final CourseRepository courseRepository;

  @Value("${kto.service-key}")
  private String serviceKey;

  // ==========================================
  // 목록 / 필터
  // ==========================================

  // 주요 장소 안내 - 구/카테고리 필터 조회. districts, categories가 비어있으면 인천 전체/전체 카테고리
  public List<PlaceSummaryResponse> getPlaces(List<District> districts, List<PlaceCategory> categories) {
    List<String> signguCds = (districts == null || districts.isEmpty())
        ? List.of("")
        : districts.stream()
            .flatMap(district -> district.getSignguCds().stream())
            .distinct()
            .collect(Collectors.toList());

    List<PlaceCategory> targetCategories = (categories == null || categories.isEmpty())
        ? List.of(PlaceCategory.values())
        : categories;

    List<PlaceSummaryResponse> result = new ArrayList<>();

    for (String signguCd : signguCds) {
      for (PlaceCategory category : targetCategories) {
        for (String contentTypeId : category.toContentTypeIds()) {
          JsonNode items = callAreaBasedList(signguCd, contentTypeId);
          for (JsonNode item : items) {
            PlaceSummaryResponse response = PlaceSummaryResponse.from(item);
            if (response.getCategory() == category) {
              result.add(response);
            }
          }
        }
      }
    }

    return result;
  }

  // 내 주변 장소 조회 - 사용자의 실제 좌표(latitude, longitude) 기준 반경 이내 장소를 조회
  // district 기준이 아니라, 관광공사의 locationBasedList2(위치기반 조회)를 사용
  public List<PlaceSummaryResponse> getPlacesNearMe(double latitude, double longitude) {
    JsonNode items = callLocationBasedList(latitude, longitude);

    List<PlaceSummaryResponse> result = new ArrayList<>();
    for (JsonNode item : items) {
      result.add(PlaceSummaryResponse.from(item));
    }
    return result;
  }

  // 해당 장소의 주변 장소 조회 - 같은 구에 속한 다른 장소 중 최대 4개 (자기 자신 제외)
  public List<PlaceSummaryResponse> getNearbyPlaces(String contentId) {
    PlaceDetailResponse target = getPlaceDetailWithoutBookmark(contentId);

    if (target.getDistrict() == null) {
      return List.of();
    }

    return getPlaces(List.of(target.getDistrict()), null).stream()
        .filter(place -> !place.getPlaceId().equals(contentId))
        .limit(4)
        .collect(Collectors.toList());
  }

  // ==========================================
  // 검색 / 자동완성
  // ==========================================

  public List<String> getAutocomplete(String keyword) {
    List<String> placeTitles = new ArrayList<>();
    for (JsonNode item : callSearchKeyword(keyword)) {
      placeTitles.add(item.path("title").asText());
    }

    List<String> courseNames = courseRepository.findByNameContainingOrDescriptionContaining(keyword, keyword)
        .stream()
        .map(course -> course.getName())
        .collect(Collectors.toList());

    List<String> suggestions = new ArrayList<>(placeTitles);
    suggestions.addAll(courseNames);
    return suggestions;
  }

  public PlaceSearchResultResponse getSearchResult(String keyword) {
    List<PlaceSummaryResponse> places = new ArrayList<>();
    for (JsonNode item : callSearchKeyword(keyword)) {
      places.add(PlaceSummaryResponse.from(item));
    }

    List<CourseSummaryResponse> courses = courseRepository
        .findByNameContainingOrDescriptionContaining(keyword, keyword).stream()
        .map(CourseSummaryResponse::new)
        .collect(Collectors.toList());

    return new PlaceSearchResultResponse(places, courses);
  }

  // ==========================================
  // 상세 / 이미지
  // ==========================================

  public PlaceDetailResponse getPlaceDetail(String contentId, Long userId) {
    PlaceDetailResponse base = getPlaceDetailWithoutBookmark(contentId);

    boolean isBookmarked = userId != null
        && placeBookmarkRepository.existsByUserIdAndContentId(userId, contentId);

    return new PlaceDetailResponse(
        base.getPlaceId(), base.getTitle(), base.getSubtitle(), base.getDescription(),
        base.getDistrict(), base.getCategory(), isBookmarked, base.getTags());
  }

  // 북마크 여부를 모른 채로(false 고정), detailCommon2 API 하나만 호출해서 상세 정보 조립
  private PlaceDetailResponse getPlaceDetailWithoutBookmark(String contentId) {
    String url = BASE_URL + "/detailCommon2"
        + "?serviceKey=" + serviceKey
        + "&MobileOS=WEB"
        + "&MobileApp=IncheonGuro"
        + "&_type=json"
        + "&contentId=" + contentId;

    JsonNode item = callApi(url);

    String contentTypeId = item.path("contenttypeid").asText();
    String lclsSystm2 = item.path("lclsSystm2").asText();
    String lclsSystm3Nm = item.path("lclsSystm3").asText();

    return new PlaceDetailResponse(
        contentId,
        item.path("title").asText(),
        item.path("addr1").asText(),
        item.path("overview").asText(),
        District.fromSignguCd(item.path("lDongSignguCd").asText()),
        PlaceCategory.fromApiCode(contentTypeId, lclsSystm2),
        false,
        lclsSystm3Nm.isBlank() ? List.of() : List.of(lclsSystm3Nm));
  }

  public List<PlaceImageResponse> getPlaceImages(String contentId) {
    String url = BASE_URL + "/detailImage2"
        + "?serviceKey=" + serviceKey
        + "&MobileOS=WEB"
        + "&MobileApp=IncheonGuro"
        + "&_type=json"
        + "&contentId=" + contentId
        + "&imageYN=Y";

    JsonNode items = callApiForItems(url);

    List<PlaceImageResponse> images = new ArrayList<>();
    for (JsonNode item : items) {
      images.add(PlaceImageResponse.from(item));
    }
    return images;
  }

  // ==========================================
  // 북마크
  // ==========================================

  public List<PlaceSummaryResponse> getBookmarkedPlaces(Long userId) {
    List<PlaceBookmark> bookmarks = placeBookmarkRepository.findByUserId(userId);

    List<PlaceSummaryResponse> result = new ArrayList<>();
    for (PlaceBookmark bookmark : bookmarks) {
      // detailCommon2로 상세를 받아온 다음, 그 안의 좌표까지 그대로 넘겨서 요약 DTO로 변환
      JsonNode item = fetchDetailCommonRaw(bookmark.getContentId());

      String contentTypeId = item.path("contenttypeid").asText();
      String lclsSystm2 = item.path("lclsSystm2").asText();

      result.add(new PlaceSummaryResponse(
          bookmark.getContentId(),
          item.path("title").asText(),
          item.path("addr1").asText(),
          District.fromSignguCd(item.path("lDongSignguCd").asText()),
          PlaceCategory.fromApiCode(contentTypeId, lclsSystm2),
          item.path("mapy").asDouble(),
          item.path("mapx").asDouble()));
    }
    return result;
  }

  public void addBookmark(String contentId, Long userId) {
    if (placeBookmarkRepository.existsByUserIdAndContentId(userId, contentId)) {
      return;
    }
    placeBookmarkRepository.save(new PlaceBookmark(userId, contentId));
  }

  public void removeBookmark(String contentId, Long userId) {
    placeBookmarkRepository.findByUserIdAndContentId(userId, contentId)
        .ifPresent(placeBookmarkRepository::delete);
  }

  /**
   * ==========================================
   * 관광공사 API 호출 헬퍼
   * ==========================================
   */

  private JsonNode callAreaBasedList(String signguCd, String contentTypeId) {
    StringBuilder url = new StringBuilder(BASE_URL + "/areaBasedList2")
        .append("?serviceKey=").append(serviceKey)
        .append("&numOfRows=100")
        .append("&pageNo=1")
        .append("&MobileOS=WEB")
        .append("&MobileApp=IncheonGuro")
        .append("&_type=json")
        .append("&arrange=C")
        .append("&contentTypeId=").append(contentTypeId)
        .append("&lDongRegnCd=").append(INCHEON_REGN_CD);

    if (signguCd != null && !signguCd.isBlank()) {
      url.append("&lDongSignguCd=").append(signguCd);
    }

    return callApiForItems(url.toString());
  }

  // 위치기반 목록 조회(locationBasedList2) 호출 - "내 주변" 탭에서 사용
  private JsonNode callLocationBasedList(double latitude, double longitude) {
    String url = BASE_URL + "/locationBasedList2"
        + "?serviceKey=" + serviceKey
        + "&numOfRows=50"
        + "&pageNo=1"
        + "&MobileOS=WEB"
        + "&MobileApp=IncheonGuro"
        + "&_type=json"
        + "&arrange=E" // 거리순 정렬
        + "&mapX=" + longitude // 관광공사 API의 mapX = 경도
        + "&mapY=" + latitude // 관광공사 API의 mapY = 위도
        + "&radius=" + DEFAULT_RADIUS_METERS;

    return callApiForItems(url);
  }

  private JsonNode callSearchKeyword(String keyword) {
    String encodedKeyword = URLEncoder.encode(keyword, StandardCharsets.UTF_8);

    String url = BASE_URL + "/searchKeyword2"
        + "?serviceKey=" + serviceKey
        + "&numOfRows=20"
        + "&pageNo=1"
        + "&MobileOS=WEB"
        + "&MobileApp=IncheonGuro"
        + "&_type=json"
        + "&arrange=C"
        + "&lDongRegnCd=" + INCHEON_REGN_CD
        + "&keyword=" + encodedKeyword;

    return callApiForItems(url);
  }

  // 북마크 목록 조회에서 좌표까지 필요해서, item(JsonNode) 자체를 그대로 반환하는 버전
  private JsonNode fetchDetailCommonRaw(String contentId) {
    String url = BASE_URL + "/detailCommon2"
        + "?serviceKey=" + serviceKey
        + "&MobileOS=WEB"
        + "&MobileApp=IncheonGuro"
        + "&_type=json"
        + "&contentId=" + contentId;

    return callApi(url);
  }

  private JsonNode callApiForItems(String url) {
    String response = restTemplate.getForObject(URI.create(url), String.class);

    try {
      return objectMapper.readTree(response)
          .path("response")
          .path("body")
          .path("items")
          .path("item");
    } catch (Exception e) {
      throw new RuntimeException("관광공사 API 응답 파싱 실패", e);
    }
  }

  private JsonNode callApi(String url) {
    JsonNode item = callApiForItems(url);
    return item.isArray() ? item.get(0) : item;
  }
}
