package com.itsup.incheonguro.courseguide.dto;

import lombok.Getter;
import java.util.List;
import java.util.Map;

// 코스 상세 경로 조회에서 사용하는 응답
@Getter
public class CourseDetailResponse {

  // 코스 고유 번호
  private Long courseId;

  // 코스 이름
  private String name;

  // 로그인한 사용자가 이 코스를 북마크했는지?
  private boolean isBookmarked;

  /**
   * 이동수단별 경로
   * - key: "walk" / "transit" / "bike" / "car"
   * - value: 그 경로의 장소 + 구간 노드 목록
   */
  private Map<String, List<RouteNodeResponse>> routes;

  public CourseDetailResponse(Long courseId, String name, boolean isBookmarked,
      Map<String, List<RouteNodeResponse>> routes) {
    this.courseId = courseId;
    this.name = name;
    this.isBookmarked = isBookmarked;
    this.routes = routes;
  }
}
