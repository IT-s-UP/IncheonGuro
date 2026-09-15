package com.itsup.incheonguro.courseguide.service;

import com.itsup.incheonguro.courseguide.dto.CourseDetailResponse;
import com.itsup.incheonguro.courseguide.dto.CourseRouteResponse;
import com.itsup.incheonguro.courseguide.dto.CourseSummaryResponse;
import com.itsup.incheonguro.courseguide.dto.RouteNodeResponse;
import com.itsup.incheonguro.courseguide.dto.RouteSegmentResponse;
import com.itsup.incheonguro.courseguide.entity.Bookmark;
import com.itsup.incheonguro.courseguide.entity.TransportMode;
import com.itsup.incheonguro.courseguide.repository.BookmarkRepository;
import com.itsup.incheonguro.courseguide.service.CourseRouteAssembler.CoursePlacePoint;
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

  // 오늘의 추천 코스 5개 (날짜 바뀌면 자동으로 다른 5개)
  public List<CourseSummaryResponse> getRecommendedCourses(Long userId) {
    try {
      List<String> ids = dailyRecommendationCacheService.getRecommendedCourseIds(LocalDate.now());
      return ids.stream()
          .map(this::findCourseItem)
          .filter(Optional::isPresent)
          .map(Optional::get)
          .map(item -> toSummary(item, userId))
          .collect(Collectors.toList());
    } catch (Exception e) {
      log.error("추천 코스 조회 실패", e);
      return List.of();
    }
  }

  // 코스 목록 조회 (keyword 없으면 인천 전체, 있으면 검색)
  public List<CourseSummaryResponse> getCourses(String keyword, Long userId) {
    try {
      List<JsonNode> items = (keyword == null || keyword.isBlank())
          ? courseCacheService.getCourseList()
          : korTourApiCourseClient.searchCourses(keyword, 100);

      return items.stream()
          .map(item -> toSummary(item, userId))
          .collect(Collectors.toList());
    } catch (Exception e) {
      log.error("코스 목록 조회 실패: keyword={}", keyword, e);
      return List.of();
    }
  }

  // 코스 상세 경로 조회
  public CourseDetailResponse getCourseDetail(String contentId, Long userId) {
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
        isBookmarked);
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
