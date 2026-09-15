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

  // GET /api/courseguide/recommended - 로그인 불필요
  @GetMapping("/recommended")
  public List<CourseSummaryResponse> getRecommendedCourses(@AuthenticationPrincipal Jwt jwt) {
    Long userId = (jwt != null) ? Long.valueOf(jwt.getSubject()) : null;
    return courseGuideService.getRecommendedCourses(userId);
  }

  // GET /api/courseguide?keyword=검색어 - 로그인 불필요, 로그인 시 isBookmarked 정확
  @GetMapping
  public List<CourseSummaryResponse> getCourses(
      @RequestParam(required = false) String keyword,
      @AuthenticationPrincipal Jwt jwt) {
    Long userId = (jwt != null) ? Long.valueOf(jwt.getSubject()) : null;
    return courseGuideService.getCourses(keyword, userId);
  }

  // GET /api/courseguide/{contentId} - 로그인 불필요, 로그인 시 isBookmarked 정확
  @GetMapping("/{contentId}")
  public CourseDetailResponse getCourseDetail(
      @PathVariable String contentId,
      @AuthenticationPrincipal Jwt jwt) {
    Long userId = (jwt != null) ? Long.valueOf(jwt.getSubject()) : null;
    return courseGuideService.getCourseDetail(contentId, userId);
  }

  // POST /api/courseguide/{contentId}/bookmark - 로그인 필수
  @PostMapping("/{contentId}/bookmark")
  public void addBookmark(
      @PathVariable String contentId,
      @AuthenticationPrincipal Jwt jwt) {
    courseGuideService.addBookmark(contentId, Long.valueOf(jwt.getSubject()));
  }

  // DELETE /api/courseguide/{contentId}/bookmark - 로그인 필수
  @DeleteMapping("/{contentId}/bookmark")
  public void removeBookmark(
      @PathVariable String contentId,
      @AuthenticationPrincipal Jwt jwt) {
    courseGuideService.removeBookmark(contentId, Long.valueOf(jwt.getSubject()));
  }
}
