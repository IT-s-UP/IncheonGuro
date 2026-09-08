package com.itsup.incheonguro.courseguide.service;

import com.itsup.incheonguro.courseguide.dto.CourseDetailResponse;
import com.itsup.incheonguro.courseguide.dto.CourseSummaryResponse;
import com.itsup.incheonguro.courseguide.dto.RouteNodeResponse;
import com.itsup.incheonguro.courseguide.entity.*;
import com.itsup.incheonguro.courseguide.repository.BookmarkRepository;
import com.itsup.incheonguro.courseguide.repository.CourseRepository;
import com.itsup.incheonguro.courseguide.repository.CourseSegmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseGuideService {

  private final CourseRepository courseRepository;
  private final CourseSegmentRepository courseSegmentRepository;
  private final BookmarkRepository bookmarkRepository;

  // 오늘의 추천 코스 목록 조회
  public List<CourseSummaryResponse> getRecommendedCourses() {
    return courseRepository.findByRecommendedTrue().stream()
        .map(CourseSummaryResponse::new)
        .collect(Collectors.toList());
  }

  // 코스 목록 조회 (keyword 있으면 검색, 없으면 전체)
  public List<CourseSummaryResponse> getCourses(String keyword, Long userId) {
    // 1) userId가 북마크한 Bookmark들을 가져와서, 그 안의 Course만 뽑아냄
    List<Course> bookmarkedCourses = bookmarkRepository.findByUserId(userId).stream()
        .map(bookmark -> bookmark.getCourse())
        .collect(Collectors.toList());

    // 2) keyword가 있으면, 북마크한 코스들 중에서 이름 또는 설명에 keyword가 포함된 것만 남김
    if (keyword != null && !keyword.isBlank()) {
      bookmarkedCourses = bookmarkedCourses.stream()
          .filter(course -> course.getName().contains(keyword)
              || course.getDescription().contains(keyword))
          .collect(Collectors.toList());
    }

    // 3) 최종 결과를 DTO로 변환해서 반환
    return bookmarkedCourses.stream()
        .map(CourseSummaryResponse::new)
        .collect(Collectors.toList());
  }

  // 코스 상세 경로 조회
  public CourseDetailResponse getCourseDetail(Long courseId, Long userId) {
    Course course = courseRepository.findById(courseId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 코스입니다. id=" + courseId));

    // userId가 있고, 그 사용자가 이 코스를 북마크했으면 true
    boolean isBookmarked = userId != null
        && bookmarkRepository.existsByUserIdAndCourseId(userId, courseId);

    // 이동수단별(도보/대중교통/자전거/자차) 경로를 조립
    Map<String, List<RouteNodeResponse>> routes = buildRoutes(course);

    return new CourseDetailResponse(
        course.getId(),
        course.getName(),
        isBookmarked,
        routes);
  }

  // 코스 하나에 대해, 이동수단 4종류 각각의 place/segment 노드 목록을 만들어서 Map으로 반환
  // 이동수단별 place/segment 노드 배열을 조립
  private Map<String, List<RouteNodeResponse>> buildRoutes(Course course) {
    Map<String, List<RouteNodeResponse>> routes = new java.util.LinkedHashMap<>();

    // 이동수단(WALK, TRANSIT, BIKE, CAR) 하나씩 돌면서 각각의 경로를 제작
    for (TransportMode mode : TransportMode.values()) {
      List<CourseSegment> segments = courseSegmentRepository
          .findByCourseIdAndTransportModeOrderByOrderIndexAsc(course.getId(), mode);

      List<RouteNodeResponse> nodes = new ArrayList<>();
      List<CoursePlace> places = course.getPlaces();

      // 장소를 순서대로 돌면서, "장소 -> 경로 -> 장소 -> 경로 -> ... -> 장소" 순으로 노드 쌓음
      for (int i = 0; i < places.size(); i++) {
        CoursePlace place = places.get(i);
        String label = toPlaceLabel(i, places.size());
        nodes.add(RouteNodeResponse.ofPlace(place, label));

        // 마지막 장소가 아니면, 그 다음에 이동구간(경로)을 끼워 넣음
        if (i < places.size() - 1 && i < segments.size()) {
          nodes.add(RouteNodeResponse.ofSegment(segments.get(i)));
        }
      }

      routes.put(mode.name().toLowerCase(), nodes);
    }

    return routes;
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
  public void addBookmark(Long courseId, Long userId) {
    if (bookmarkRepository.existsByUserIdAndCourseId(userId, courseId)) {
      return; // 이미 북마크되어 있으면 아무것도 X
    }

    // 북마크할 코스를 찾고, 없으면 예외 처리
    Course course = courseRepository.findById(courseId)
        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 코스입니다. id=" + courseId));

    // 새 북마크를 만들어서 DB에 저장
    Bookmark bookmark = new Bookmark(userId, course);
    bookmarkRepository.save(bookmark);
  }

  // 북마크 해제
  @Transactional
  public void removeBookmark(Long courseId, Long userId) {
    bookmarkRepository.findByUserIdAndCourseId(userId, courseId)
        .ifPresent(bookmarkRepository::delete);
  }
}
