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
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlaceGuideService {

  private static final String BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
  private static final String INCHEON_REGN_CD = "28";

  private final RestTemplate restTemplate;
  private final ObjectMapper objectMapper;
  private final PlaceBookmarkRepository placeBookmarkRepository;
  private final CourseRepository courseRepository;

  // 상세조회(detailCommon2/Intro2/Image2/Info2) 캐싱을 전담하는 서비스
  // (목록/검색 계열은 조건 조합이 매번 달라서 캐싱 효과가 적어 그대로 두고, 상세 조회만 캐싱함)
  private final PlaceCacheService placeCacheService;

  @Value("${kto.service-key}")
  private String serviceKey;

  // ==========================================
  // 목록 / 필터
  // ==========================================

  public List<PlaceSummaryResponse> getPlaces(List<District> districts, List<PlaceCategory> categories) {
    boolean isAllDistrictsSelected = districts != null && districts.size() == District.values().length;

    List<String> signguCds = (districts == null || districts.isEmpty() || isAllDistrictsSelected)
        ? List.of("")
        : districts.stream()
            .map(District::getSignguCd)
            .collect(Collectors.toList());

    List<PlaceCategory> targetCategories = (categories == null || categories.isEmpty())
        ? List.of(PlaceCategory.values())
        : categories;

    Set<String> contentTypeIds = targetCategories.stream()
        .flatMap(category -> category.toContentTypeIds().stream())
        .collect(Collectors.toSet());

    List<PlaceSummaryResponse> result = new ArrayList<>();

    for (String signguCd : signguCds) {
      for (String contentTypeId : contentTypeIds) {
        JsonNode items = callAreaBasedList(signguCd, contentTypeId);
        for (JsonNode item : items) {
          PlaceSummaryResponse response = PlaceSummaryResponse.from(item);
          if (targetCategories.contains(response.getCategory())) {
            result.add(response);
          }
        }
      }
    }

    return result;
  }

  public List<PlaceSummaryResponse> getPlacesNearMe(double latitude, double longitude) {
    JsonNode items = callLocationBasedList(latitude, longitude);

    List<PlaceSummaryResponse> result = new ArrayList<>();
    for (JsonNode item : items) {
      result.add(PlaceSummaryResponse.from(item));
    }
    return result;
  }

  public List<PlaceSummaryResponse> getNearbyPlaces(String contentId) {
    PlaceDetailResponse target = getPlaceDetailWithoutBookmark(contentId);

    if (target.getDistrict() == null || target.getCategory() == null) {
      return List.of();
    }

    return getPlaces(List.of(target.getDistrict()), List.of(target.getCategory())).stream()
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
  // 상세 / 이미지 (PlaceCacheService를 통해 캐싱된 원본 데이터를 사용)
  // ==========================================

  public PlaceDetailResponse getPlaceDetail(String contentId, Long userId) {
    PlaceDetailResponse base = getPlaceDetailWithoutBookmark(contentId);

    boolean isBookmarked = userId != null
        && placeBookmarkRepository.existsByUserIdAndContentId(userId, contentId);

    return new PlaceDetailResponse(
        base.getPlaceId(), base.getTitle(), base.getSubtitle(), base.getDescription(),
        base.getDistrict(), base.getCategory(), isBookmarked, base.getTags(),
        base.getLatitude(), base.getLongitude(),
        base.getUsageTime(), base.getRestDate(), base.getParking(), base.getInfoCenter(),
        base.getExtraInfoTexts());
  }

  private PlaceDetailResponse getPlaceDetailWithoutBookmark(String contentId) {
    JsonNode item = placeCacheService.getDetailCommon(contentId);

    String contentTypeId = item.path("contenttypeid").asText();
    String lclsSystm2 = item.path("lclsSystm2").asText();

    PlaceCategory category = PlaceCategory.fromApiCode(contentTypeId, lclsSystm2);

    IntroInfo introInfo = fetchIntroInfo(contentId, contentTypeId);

    boolean allIntroInfoEmpty = introInfo.usageTime().isBlank()
        && introInfo.restDate().isBlank()
        && introInfo.parking().isBlank()
        && introInfo.infoCenter().isBlank();
    List<String> extraInfoTexts = allIntroInfoEmpty
        ? fetchExtraInfoTexts(contentId, contentTypeId)
        : List.of();

    List<String> tags = new ArrayList<>();
    if (category != null) {
      tags.add(toKoreanCategoryTag(category));
    }
    tags.addAll(introInfo.tags());

    return new PlaceDetailResponse(
        contentId,
        item.path("title").asText(),
        item.path("addr1").asText(),
        item.path("overview").asText(),
        District.fromSignguCd(item.path("lDongSignguCd").asText()),
        category,
        false,
        tags,
        item.path("mapy").asDouble(),
        item.path("mapx").asDouble(),
        introInfo.usageTime(),
        introInfo.restDate(),
        introInfo.parking(),
        introInfo.infoCenter(),
        extraInfoTexts);
  }

  private IntroInfo fetchIntroInfo(String contentId, String contentTypeId) {
    JsonNode item = placeCacheService.getDetailIntro(contentId, contentTypeId);

    String usageTime = switch (contentTypeId) {
      case "12" -> item.path("usetime").asText("");
      case "14" -> item.path("usetimeculture").asText("");
      case "28" -> item.path("usetimeleports").asText("");
      case "32" -> item.path("checkintime").asText("");
      case "38" -> item.path("opentime").asText("");
      case "39" -> item.path("opentimefood").asText("");
      default -> "";
    };

    String restDate = switch (contentTypeId) {
      case "12" -> item.path("restdate").asText("");
      case "14" -> item.path("restdateculture").asText("");
      case "28" -> item.path("restdateleports").asText("");
      case "38" -> item.path("restdateshopping").asText("");
      case "39" -> item.path("restdatefood").asText("");
      default -> "";
    };

    String parking = switch (contentTypeId) {
      case "12" -> item.path("parking").asText("");
      case "14" -> item.path("parkingculture").asText("");
      case "28" -> item.path("parkingleports").asText("");
      case "32" -> item.path("parkinglodging").asText("");
      case "38" -> item.path("parkingshopping").asText("");
      case "39" -> item.path("parkingfood").asText("");
      default -> "";
    };

    String infoCenter = switch (contentTypeId) {
      case "12" -> item.path("infocenter").asText("");
      case "14" -> item.path("infocenterculture").asText("");
      case "28" -> item.path("infocenterleports").asText("");
      case "32" -> item.path("infocenterlodging").asText("");
      case "38" -> item.path("infocentershopping").asText("");
      case "39" -> item.path("infocenterfood").asText("");
      default -> "";
    };

    List<String> tags = new ArrayList<>();
    switch (contentTypeId) {
      case "39" -> {
        addIfNotBlank(tags, item.path("firstmenu").asText(""));
        addIfNotBlank(tags, item.path("treatmenu").asText(""));
      }
      case "38" -> addIfNotBlank(tags, item.path("saleitem").asText(""));
      default -> {
      }
    }

    return new IntroInfo(usageTime, restDate, parking, infoCenter, tags);
  }

  private void addIfNotBlank(List<String> tags, String value) {
    if (value == null || value.isBlank())
      return;
    for (String part : value.split(",")) {
      String trimmed = part.trim();
      if (!trimmed.isEmpty()) {
        tags.add(trimmed);
      }
    }
  }

  private String toKoreanCategoryTag(PlaceCategory category) {
    return switch (category) {
      case ATTRACTION -> "관광지";
      case CAFE -> "카페";
      case RESTAURANT -> "식당";
      case LODGING -> "숙소";
      case SHOPPING -> "쇼핑";
    };
  }

  private record IntroInfo(String usageTime, String restDate, String parking, String infoCenter,
      List<String> tags) {
  }

  private List<String> fetchExtraInfoTexts(String contentId, String contentTypeId) {
    List<String> result = new ArrayList<>();
    try {
      JsonNode items = placeCacheService.getDetailInfo(contentId, contentTypeId);
      for (JsonNode item : items) {
        String name = item.path("infoname").asText("").trim();
        String text = item.path("infotext").asText("").trim();
        if (!name.isBlank() && !text.isBlank()) {
          result.add(name + " : " + text);
        }
      }
    } catch (Exception e) {
      // 이 오퍼레이션을 지원하지 않는 카테고리(숙박/여행코스 등)일 수 있으므로, 실패해도 조용히 빈 목록 반환
    }
    return result;
  }

  public List<PlaceImageResponse> getPlaceImages(String contentId) {
    JsonNode items = placeCacheService.getDetailImages(contentId);

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
      JsonNode item = placeCacheService.getDetailCommon(bookmark.getContentId());

      String contentTypeId = item.path("contenttypeid").asText();
      String lclsSystm2 = item.path("lclsSystm2").asText();

      result.add(new PlaceSummaryResponse(
          bookmark.getContentId(),
          item.path("title").asText(),
          item.path("addr1").asText(),
          District.fromSignguCd(item.path("lDongSignguCd").asText()),
          PlaceCategory.fromApiCode(contentTypeId, lclsSystm2),
          item.path("mapy").asDouble(),
          item.path("mapx").asDouble(),
          item.path("firstimage").asText(""),
          lclsSystm2));
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

  // ==========================================
  // 관광공사 API 호출 헬퍼 (목록/검색 계열 - 캐싱 대상 아님, 그대로 유지)
  // ==========================================

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

  private JsonNode callLocationBasedList(double latitude, double longitude) {
    String url = BASE_URL + "/locationBasedList2"
        + "?serviceKey=" + serviceKey
        + "&numOfRows=50"
        + "&pageNo=1"
        + "&MobileOS=WEB"
        + "&MobileApp=IncheonGuro"
        + "&_type=json"
        + "&arrange=E"
        + "&mapX=" + longitude
        + "&mapY=" + latitude
        + "&radius=2000";

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
}
