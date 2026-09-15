package com.itsup.incheonguro.courseguide.dto;

import lombok.Getter;
import java.util.List;
import java.util.Map;

// 코스 상세 경로 조회에서 사용하는 응답
@Getter
public class CourseDetailResponse {

  // 코스 고유 번호 -> 관광공사 contentId로 바뀌어서 String
  private String courseId;

  private String name;

  private boolean isBookmarked;

  private Map<String, List<RouteNodeResponse>> routes;

  public CourseDetailResponse(String courseId, String name, boolean isBookmarked,
      Map<String, List<RouteNodeResponse>> routes) {
    this.courseId = courseId;
    this.name = name;
    this.isBookmarked = isBookmarked;
    this.routes = routes;
  }
}
