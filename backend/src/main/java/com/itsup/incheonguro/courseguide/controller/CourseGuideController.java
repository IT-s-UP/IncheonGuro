package com.itsup.incheonguro.courseguide.controller;

import com.itsup.incheonguro.courseguide.dto.CourseDetailResponse;
import com.itsup.incheonguro.courseguide.dto.CourseSummaryResponse;
import com.itsup.incheonguro.courseguide.service.CourseGuideService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// 코스 안내(추천/목록/상세/북마크) API의 URL을 정의하는 컨트롤러
@RestController
@RequestMapping("/api/courseguide")
@RequiredArgsConstructor
public class CourseGuideController {

  private final CourseGuideService courseGuideService;

  // GET /api/courseguide/recommended
  @GetMapping("/recommended")
  public List<CourseSummaryResponse> getRecommendedCourses() {
    return courseGuideService.getRecommendedCourses();
  }

  // GET /api/courseguide?keyword=검색어
  @GetMapping
  public List<CourseSummaryResponse> getCourses(
      @RequestParam(required = false) String keyword,
      @AuthenticationPrincipal Jwt jwt) {
    Long userId = Long.valueOf(jwt.getSubject());
    return courseGuideService.getCourses(keyword, userId);
  }

  // GET /api/courseguide/{courseId}
  @GetMapping("/{courseId}")
  public CourseDetailResponse getCourseDetail(
      @PathVariable Long courseId,
      @AuthenticationPrincipal Jwt jwt) {
    Long userId = Long.valueOf(jwt.getSubject());
    return courseGuideService.getCourseDetail(courseId, userId);
  }

  // POST /api/courseguide/{courseId}/bookmark
  @PostMapping("/{courseId}/bookmark")
  public void addBookmark(
      @PathVariable Long courseId,
      @AuthenticationPrincipal Jwt jwt) {
    Long userId = Long.valueOf(jwt.getSubject());
    courseGuideService.addBookmark(courseId, userId);
  }

  // DELETE /api/courseguide/{courseId}/bookmark
  @DeleteMapping("/{courseId}/bookmark")
  public void removeBookmark(
      @PathVariable Long courseId,
      @AuthenticationPrincipal Jwt jwt) {
    Long userId = Long.valueOf(jwt.getSubject());
    courseGuideService.removeBookmark(courseId, userId);
  }
}
