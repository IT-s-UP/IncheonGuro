package com.itsup.incheonguro.courseguide.service;

import com.itsup.incheonguro.courseguide.dto.CourseDetailResponse;
import com.itsup.incheonguro.courseguide.dto.CourseRouteResponse;
import com.itsup.incheonguro.courseguide.dto.CourseSummaryResponse;
import com.itsup.incheonguro.courseguide.dto.EstimatedCostResponse;
import com.itsup.incheonguro.courseguide.dto.RouteNodeResponse;
import com.itsup.incheonguro.courseguide.dto.RouteSegmentResponse;
import com.itsup.incheonguro.courseguide.entity.Bookmark;
import com.itsup.incheonguro.courseguide.entity.LocalCourse;
import com.itsup.incheonguro.courseguide.entity.LocalCoursePlace;
import com.itsup.incheonguro.courseguide.entity.TransportMode;
import com.itsup.incheonguro.courseguide.repository.BookmarkRepository;
import com.itsup.incheonguro.courseguide.repository.LocalCoursePlaceRepository;
import com.itsup.incheonguro.courseguide.repository.LocalCourseRepository;
import com.itsup.incheonguro.courseguide.service.CourseRouteAssembler.CoursePlacePoint;
import com.itsup.incheonguro.placeguide.entity.PlaceCategory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseGuideService {

  private final CourseCacheService courseCacheService;
  private final DailyRecommendationCacheService dailyRecommendationCacheService;
  private final KorTourApiCourseClient korTourApiCourseClient; // 키워드 검색은 조건이 매번 달라 캐싱 안 함
  private final BookmarkRepository bookmarkRepository;
  private final CourseRouteCacheService courseRouteCacheService;
  private final LocalCourseRepository localCourseRepository;
  private final LocalCoursePlaceRepository localCoursePlaceRepository;

  private static final String LOCAL_ID_PREFIX = "local-";

  // "코스 저장하기" 시 예상 비용 초기값 계산에 씀 - courserecommend.CourseRecommendService와 동일한 기준액
  private static final int TRANSIT_DAILY_COST = 5000;
  private static final Map<PlaceCategory, Integer> CATEGORY_AVG_COST = Map.of(
      PlaceCategory.ATTRACTION, 8000,
      PlaceCategory.CAFE, 7000,
      PlaceCategory.RESTAURANT, 15000,
      PlaceCategory.SHOPPING, 20000);

  // 우리가 직접 고른 코스의 정거장은 관광공사 카테고리 코드가 없어서, 장소 이름으로 직접 분류함
  private static final Map<String, PlaceCategory> LOCAL_PLACE_CATEGORY = Map.<String, PlaceCategory>ofEntries(
      Map.entry("인천역", PlaceCategory.ATTRACTION),
      Map.entry("인천차이나타운", PlaceCategory.ATTRACTION),
      Map.entry("공화춘", PlaceCategory.RESTAURANT),
      Map.entry("자유공원", PlaceCategory.ATTRACTION),
      Map.entry("신포국제시장", PlaceCategory.SHOPPING),
      Map.entry("월미테마파크", PlaceCategory.ATTRACTION),
      Map.entry("월미문화의거리", PlaceCategory.ATTRACTION),
      Map.entry("전라도대왕조개구이", PlaceCategory.RESTAURANT),
      Map.entry("월미공원 전망대", PlaceCategory.ATTRACTION),
      Map.entry("선녀바위해변", PlaceCategory.ATTRACTION),
      Map.entry("을왕리해수욕장", PlaceCategory.ATTRACTION),
      Map.entry("왕산해수욕장", PlaceCategory.ATTRACTION),
      Map.entry("청춘조개 을왕리직영점", PlaceCategory.RESTAURANT),
      Map.entry("마시란해변", PlaceCategory.ATTRACTION),
      Map.entry("실미유원지", PlaceCategory.ATTRACTION),
      Map.entry("무의도 하나개해수욕장", PlaceCategory.ATTRACTION),
      Map.entry("호룡곡산산림욕장", PlaceCategory.ATTRACTION),
      Map.entry("하나개횟집", PlaceCategory.RESTAURANT),
      Map.entry("청라호수공원", PlaceCategory.ATTRACTION),
      Map.entry("청라시티타워", PlaceCategory.ATTRACTION),
      Map.entry("송도어반 청라점", PlaceCategory.CAFE),
      Map.entry("커널웨이", PlaceCategory.SHOPPING),
      Map.entry("정서진", PlaceCategory.ATTRACTION),
      Map.entry("정서진 아라타워", PlaceCategory.ATTRACTION),
      Map.entry("아르테파인 라운지 인천", PlaceCategory.CAFE),
      Map.entry("계양산", PlaceCategory.ATTRACTION),
      Map.entry("계양산성", PlaceCategory.ATTRACTION),
      Map.entry("계양산장미원", PlaceCategory.ATTRACTION),
      Map.entry("계양문화회관", PlaceCategory.ATTRACTION),
      Map.entry("놀부홍두깨칼국수 계양산점", PlaceCategory.RESTAURANT),
      Map.entry("부평 캠프마켓", PlaceCategory.ATTRACTION),
      Map.entry("부평공원", PlaceCategory.ATTRACTION),
      Map.entry("부평문화의거리", PlaceCategory.ATTRACTION),
      Map.entry("부평역지하상가", PlaceCategory.SHOPPING),
      Map.entry("수봉공원", PlaceCategory.ATTRACTION),
      Map.entry("수봉공원 스카이워크전망대", PlaceCategory.ATTRACTION),
      Map.entry("수봉공원 인천지구전적비", PlaceCategory.ATTRACTION),
      Map.entry("공원장", PlaceCategory.RESTAURANT),
      Map.entry("소래포구종합어시장", PlaceCategory.SHOPPING),
      Map.entry("소래역사관", PlaceCategory.ATTRACTION),
      Map.entry("소래습지생태공원", PlaceCategory.ATTRACTION),
      Map.entry("소래철교", PlaceCategory.ATTRACTION),
      Map.entry("인천대공원 장미원", PlaceCategory.ATTRACTION),
      Map.entry("인천수목원 온실", PlaceCategory.ATTRACTION),
      Map.entry("인천대공원 습지원", PlaceCategory.ATTRACTION),
      Map.entry("인천대공원 동물원", PlaceCategory.ATTRACTION),
      Map.entry("송도달빛축제공원", PlaceCategory.ATTRACTION),
      Map.entry("송도 센트럴파크", PlaceCategory.ATTRACTION),
      Map.entry("G타워 전망대", PlaceCategory.ATTRACTION),
      Map.entry("트리플스트리트", PlaceCategory.SHOPPING),
      Map.entry("아암도해안공원", PlaceCategory.ATTRACTION),
      Map.entry("인천상륙작전기념관", PlaceCategory.ATTRACTION),
      Map.entry("능허대공원", PlaceCategory.ATTRACTION),
      Map.entry("바다쏭 인천연수점", PlaceCategory.CAFE),
      Map.entry("강화고인돌공원", PlaceCategory.ATTRACTION),
      Map.entry("강화역사박물관", PlaceCategory.ATTRACTION),
      Map.entry("고려산", PlaceCategory.ATTRACTION),
      Map.entry("용흥궁식당", PlaceCategory.RESTAURANT),
      Map.entry("광성보", PlaceCategory.ATTRACTION),
      Map.entry("덕진진", PlaceCategory.ATTRACTION),
      Map.entry("초지진", PlaceCategory.ATTRACTION),
      Map.entry("전등사", PlaceCategory.ATTRACTION),
      Map.entry("죽림다원", PlaceCategory.CAFE),
      Map.entry("십리포해수욕장", PlaceCategory.ATTRACTION),
      Map.entry("국사봉", PlaceCategory.ATTRACTION),
      Map.entry("영흥수협수산물직판장", PlaceCategory.SHOPPING));

  // 오늘의 추천 코스 5개 (날짜 바뀌면 자동으로 다른 5개) + 우리가 직접 고른 코스 중 추천 표시된 것들
  public List<CourseSummaryResponse> getRecommendedCourses(Long userId) {
    List<CourseSummaryResponse> result = new ArrayList<>();

    try {
      List<String> ids = dailyRecommendationCacheService.getRecommendedCourseIds(LocalDate.now());
      ids.stream()
          .map(this::findCourseItem)
          .filter(Optional::isPresent)
          .map(Optional::get)
          .map(item -> toSummary(item, userId))
          .forEach(result::add);
    } catch (Exception e) {
      log.error("추천 코스 조회 실패", e);
    }

    localCourseRepository.findAll().stream()
        .filter(LocalCourse::isRecommended)
        .map(course -> toLocalSummary(course, userId))
        .forEach(result::add);

    return result;
  }

  // 코스 목록 조회 (keyword 없으면 인천 전체, 있으면 검색) + 우리가 직접 고른 코스
  public List<CourseSummaryResponse> getCourses(String keyword, Long userId) {
    List<CourseSummaryResponse> result = new ArrayList<>();

    try {
      List<JsonNode> items = (keyword == null || keyword.isBlank())
          ? courseCacheService.getCourseList()
          : korTourApiCourseClient.searchCourses(keyword, 100);

      items.stream().map(item -> toSummary(item, userId)).forEach(result::add);
    } catch (Exception e) {
      log.error("코스 목록 조회 실패: keyword={}", keyword, e);
    }

    localCourseRepository.findAll().stream()
        .filter(course -> keyword == null || keyword.isBlank() || course.getName().contains(keyword))
        .map(course -> toLocalSummary(course, userId))
        .forEach(result::add);

    return result;
  }

  // 코스 상세 경로 조회
  public CourseDetailResponse getCourseDetail(String contentId, Long userId) {
    if (contentId.startsWith(LOCAL_ID_PREFIX)) {
      return getLocalCourseDetail(contentId, userId);
    }

    JsonNode courseItem = findCourseItem(contentId)
        .orElseGet(() -> courseCacheService.getDetailCommon(contentId)); // 목록 캐시에 없으면 개별 조회로 폴백

    if (courseItem == null) {
      throw new IllegalArgumentException("존재하지 않는 코스입니다. contentId=" + contentId);
    }

    String name = courseItem.path("title").asText();
    boolean isBookmarked = userId != null
        && bookmarkRepository.existsByUserIdAndContentId(userId, contentId);

    List<Waypoint> waypoints = resolveWaypoints(contentId);
    Map<String, List<RouteNodeResponse>> routes = buildRoutes(contentId, waypoints);

    return new CourseDetailResponse(contentId, name, isBookmarked, routes);
  }

  // 우리가 직접 고른 코스는 위경도를 이미 갖고 있어서, 관광공사 API 호출 없이 바로 경로를 계산함
  private CourseDetailResponse getLocalCourseDetail(String contentId, Long userId) {
    Long localId = Long.parseLong(contentId.substring(LOCAL_ID_PREFIX.length()));
    LocalCourse course = localCourseRepository.findById(localId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 코스입니다. contentId=" + contentId));

    boolean isBookmarked = userId != null
        && bookmarkRepository.existsByUserIdAndContentId(userId, contentId);

    List<LocalCoursePlace> places = localCoursePlaceRepository.findByCourseIdOrderByOrderIndexAsc(localId);

    List<Waypoint> waypoints = places.stream()
        .map(place -> new Waypoint(place.getName(), place.getAddress(), place.getLatitude(), place.getLongitude()))
        .toList();

    Map<String, List<RouteNodeResponse>> routes = buildRoutes(contentId, waypoints);
    EstimatedCostResponse estimatedCost = estimateLocalCourseCost(places);

    return new CourseDetailResponse(contentId, course.getName(), isBookmarked, routes, estimatedCost);
  }

  // courserecommend.CourseRecommendService와 동일한 카테고리별 평균 비용 방식으로 계산.
  // 정거장 이름을 모르는 카테고리는 비용에 포함하지 않음(0원)
  private EstimatedCostResponse estimateLocalCourseCost(List<LocalCoursePlace> places) {
    int food = 0;
    int admission = 0;
    int etc = 0;

    for (LocalCoursePlace place : places) {
      PlaceCategory category = LOCAL_PLACE_CATEGORY.get(place.getName());
      if (category == null) {
        continue;
      }

      int amount = CATEGORY_AVG_COST.getOrDefault(category, 0);
      switch (category) {
        case ATTRACTION -> admission += amount;
        case RESTAURANT, CAFE -> food += amount;
        case SHOPPING -> etc += amount;
        default -> {
          // 그 외 카테고리는 비용 기준이 없어 반영하지 않음
        }
      }
    }

    return new EstimatedCostResponse(TRANSIT_DAILY_COST, food, admission, etc);
  }

  private CourseSummaryResponse toLocalSummary(LocalCourse course, Long userId) {
    String contentId = course.toContentId();
    boolean isBookmarked = userId != null
        && bookmarkRepository.existsByUserIdAndContentId(userId, contentId);

    return new CourseSummaryResponse(contentId, course.getName(), course.getDescription(),
        course.getImageUrl(), isBookmarked);
  }

  // 캐싱된 코스 목록에서 contentId로 항목 하나 찾기 (추가 API 호출 없이 재사용)
  private Optional<JsonNode> findCourseItem(String contentId) {
    return courseCacheService.getCourseList().stream()
        .filter(item -> contentId.equals(item.path("contentid").asText()))
        .findFirst();
  }

  private CourseSummaryResponse toSummary(JsonNode item, Long userId) {
    String contentId = item.path("contentid").asText();
    boolean isBookmarked = userId != null
        && bookmarkRepository.existsByUserIdAndContentId(userId, contentId);

    return new CourseSummaryResponse(
        contentId,
        item.path("title").asText(),
        item.path("addr1").asText(""),
        resolveCourseImageUrl(item, contentId), // 신규 - 코스 자체 이미지 없으면 정거장 이미지로 폴백
        isBookmarked);
  }

  // 코스 대표 이미지 결정: 1순위 코스 자체(firstimage), 없으면 2순위 정거장들을 순서대로 뒤져서
  // 이미지가 있는 첫 번째 정거장의 것을 사용. courseCacheService의
  // getCourseSubItems/getDetailCommon이
  // 둘 다 캐싱되어 있어서, 같은 코스에 대해 두 번째 호출부터는 API가 안 나감
  private String resolveCourseImageUrl(JsonNode item, String contentId) {
    String courseImage = item.path("firstimage").asText("");
    if (!courseImage.isBlank()) {
      return courseImage;
    }

    try {
      List<JsonNode> subItems = courseCacheService.getCourseSubItems(contentId);
      for (JsonNode subItem : subItems) {
        String subContentId = subItem.path("subcontentid").asText("");
        if (subContentId.isBlank() || "0".equals(subContentId)) {
          continue;
        }

        JsonNode spot = courseCacheService.getDetailCommon(subContentId);
        if (spot == null) {
          continue;
        }

        String spotImage = spot.path("firstimage").asText("");
        if (!spotImage.isBlank()) {
          return spotImage;
        }
      }
    } catch (Exception e) {
      log.warn("코스 대체 이미지 조회 실패: courseId={}", contentId, e);
    }

    return ""; // 코스도, 정거장도 전부 이미지 없으면 빈 문자열 -> 프론트에서 placeholder 표시
  }

  // 코스에 속한 정거장(이름/주소/좌표) 목록을 순서대로 조립
  // subcontentid로 각 정거장의 실제 좌표(detailCommon2)를 가져옴
  private List<Waypoint> resolveWaypoints(String courseContentId) {
    List<JsonNode> subItems = courseCacheService.getCourseSubItems(courseContentId);
    List<Waypoint> waypoints = new ArrayList<>();

    for (JsonNode subItem : subItems) {
      String name = subItem.path("subname").asText();
      String subContentId = subItem.path("subcontentid").asText();

      if (subContentId.isBlank() || "0".equals(subContentId)) {
        log.warn("정거장이 콘텐츠와 연결 안 됨(subcontentid 없음): courseId={}, 정거장={}", courseContentId, name);
        waypoints.add(new Waypoint(name, "", null, null));
        continue;
      }

      JsonNode spot = courseCacheService.getDetailCommon(subContentId);
      if (spot == null) {
        log.warn("정거장 상세정보 조회 실패: courseId={}, subcontentid={}", courseContentId, subContentId);
        waypoints.add(new Waypoint(name, "", null, null));
        continue;
      }

      waypoints.add(new Waypoint(
          name,
          spot.path("addr1").asText(""),
          parseNullableDouble(spot, "mapy"),
          parseNullableDouble(spot, "mapx")));
    }

    return waypoints;
  }

  private Double parseNullableDouble(JsonNode node, String field) {
    String value = node.path(field).asText("");
    if (value.isBlank()) {
      return null;
    }
    try {
      return Double.parseDouble(value);
    } catch (NumberFormatException e) {
      return null;
    }
  }

  // 이동수단 4종류 각각의 place/segment 노드 목록을 만들어서 Map으로 반환
  private Map<String, List<RouteNodeResponse>> buildRoutes(String contentId, List<Waypoint> waypoints) {
    Map<String, List<RouteNodeResponse>> routes = new LinkedHashMap<>();
    for (TransportMode mode : TransportMode.values()) {
      routes.put(mode.name().toLowerCase(), buildLiveRouteNodes(contentId, mode, waypoints));
    }
    return routes;
  }

  // 카카오 경로 조회 API로 실시간 조회 + 캐싱. 좌표 누락/전체 실패 시 "정보 없음"으로 안전하게 대체
  private List<RouteNodeResponse> buildLiveRouteNodes(String contentId, TransportMode mode, List<Waypoint> waypoints) {
    if (waypoints.size() < 2) {
      return buildUnavailableRouteNodes(waypoints, mode);
    }

    boolean hasMissingCoordinate = waypoints.stream()
        .anyMatch(w -> w.latitude() == null || w.longitude() == null);

    if (hasMissingCoordinate) {
      log.warn("좌표 없는 정거장 포함, 경로 조회 건너뜀: courseId={}, mode={}", contentId, mode);
      return buildUnavailableRouteNodes(waypoints, mode);
    }

    List<CoursePlacePoint> points = waypoints.stream()
        .map(w -> new CoursePlacePoint(w.name(), w.longitude(), w.latitude()))
        .toList();

    try {
      CourseRouteResponse routeResponse = courseRouteCacheService.getRoute(contentId, mode, points);

      List<RouteNodeResponse> nodes = new ArrayList<>();
      for (int i = 0; i < waypoints.size(); i++) {
        Waypoint w = waypoints.get(i);
        nodes.add(RouteNodeResponse.ofPlace(w.name(), w.address(), toPlaceLabel(i, waypoints.size()), w.latitude(),
            w.longitude()));

        if (i < waypoints.size() - 1) {
          RouteSegmentResponse seg = routeResponse.segments().get(i);
          nodes.add(seg.available()
              ? RouteNodeResponse.ofLiveSegment(mode, seg.distanceMeters(), seg.durationSeconds())
              : RouteNodeResponse.ofUnavailableSegment(mode));
        }
      }
      return nodes;
    } catch (Exception e) {
      log.error("코스 경로 조회 실패: courseId={}, mode={}", contentId, mode, e);
      return buildUnavailableRouteNodes(waypoints, mode);
    }
  }

  private List<RouteNodeResponse> buildUnavailableRouteNodes(List<Waypoint> waypoints, TransportMode mode) {
    List<RouteNodeResponse> nodes = new ArrayList<>();
    for (int i = 0; i < waypoints.size(); i++) {
      Waypoint w = waypoints.get(i);
      nodes.add(RouteNodeResponse.ofPlace(w.name(), w.address(), toPlaceLabel(i, waypoints.size()), w.latitude(),
          w.longitude()));
      if (i < waypoints.size() - 1) {
        nodes.add(RouteNodeResponse.ofUnavailableSegment(mode));
      }
    }
    return nodes;
  }

  private String toPlaceLabel(int index, int totalSize) {
    if (index == 0)
      return "출발지";
    if (index == totalSize - 1)
      return "도착지";
    return "경유지" + index;
  }

  // 북마크 등록
  @Transactional
  public void addBookmark(String contentId, Long userId) {
    if (bookmarkRepository.existsByUserIdAndContentId(userId, contentId)) {
      return;
    }
    bookmarkRepository.save(new Bookmark(userId, contentId));
  }

  // 북마크 해제
  @Transactional
  public void removeBookmark(String contentId, Long userId) {
    bookmarkRepository.findByUserIdAndContentId(userId, contentId)
        .ifPresent(bookmarkRepository::delete);
  }

  // 정거장(장소) 하나를 나타내는 내부 record. 좌표는 못 찾은 경우 null일 수 있음
  private record Waypoint(String name, String address, Double latitude, Double longitude) {
  }
}
