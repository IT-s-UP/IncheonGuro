package com.itsup.incheonguro.courseguide.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
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

  // 우리가 직접 고른 코스만 값이 있음(관광공사 코스는 정거장별 카테고리를 모르므로 null).
  // "코스 저장하기" 시 이 값이 CourseCost 초기값으로 들어감
  @JsonInclude(JsonInclude.Include.NON_NULL)
  private EstimatedCostResponse estimatedCost;

  public CourseDetailResponse(String courseId, String name, boolean isBookmarked,
      Map<String, List<RouteNodeResponse>> routes) {
    this(courseId, name, isBookmarked, routes, null);
  }

  public CourseDetailResponse(String courseId, String name, boolean isBookmarked,
      Map<String, List<RouteNodeResponse>> routes, EstimatedCostResponse estimatedCost) {
    this.courseId = courseId;
    this.name = name;
    this.isBookmarked = isBookmarked;
    this.routes = routes;
    this.estimatedCost = estimatedCost;
  }
}
