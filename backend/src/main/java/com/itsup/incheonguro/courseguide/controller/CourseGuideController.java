package com.itsup.incheonguro.courseguide.controller;

import com.itsup.incheonguro.courseguide.dto.CourseDetailResponse;
import com.itsup.incheonguro.courseguide.dto.CourseSummaryResponse;
import com.itsup.incheonguro.courseguide.service.CourseGuideService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// 코스 안내(추천/목록/상세/북마크) API의 URL을 정의하는 컨트롤러
@RestController
@RequestMapping("/api/courseguide")
@RequiredArgsConstructor
public class CourseGuideController {

  private final CourseGuideService courseGuideService;

  // GET /api/courseguide/recommended
  // 오늘의 추천 코스 목록 조회
  @GetMapping("/recommended")
  public List<CourseSummaryResponse> getRecommendedCourses() {
    return courseGuideService.getRecommendedCourses();
  }

  // GET /api/courseguide?keyword=검색어
  // 코스 목록 조회 (북마크한 코스 중에서 keyword로 검색, keyword 없으면 북마크한 코스 전체)
  @GetMapping
  public List<CourseSummaryResponse> getCourses(
      @RequestParam(required = false) String keyword) {
    Long userId = 1L; // TODO: 로그인 기능 완성되면 실제 userId로 교체
    return courseGuideService.getCourses(keyword, userId);
  }

  // GET /api/courseguide/{courseId}
  // 코스 상세 경로 조회
  @GetMapping("/{courseId}")
  public CourseDetailResponse getCourseDetail(@PathVariable Long courseId) {
    Long userId = 1L; // TODO: 로그인 기능 완성되면 실제 userId로 교체 (지금은 테스트용 임시값)
    return courseGuideService.getCourseDetail(courseId, userId);
  }

  // POST /api/courseguide/{courseId}/bookmark
  // 북마크 등록
  @PostMapping("/{courseId}/bookmark")
  public void addBookmark(@PathVariable Long courseId) {
    Long userId = 1L; // TODO: 로그인 기능 완성되면 실제 userId로 교체 (지금은 테스트용 임시값)
    courseGuideService.addBookmark(courseId, userId);
  }

  // DELETE /api/courseguide/{courseId}/bookmark
  // 북마크 해제
  @DeleteMapping("/{courseId}/bookmark")
  public void removeBookmark(@PathVariable Long courseId) {
    Long userId = 1L; // TODO: 로그인 기능 완성되면 실제 userId로 교체 (지금은 테스트용 임시값)
    courseGuideService.removeBookmark(courseId, userId);
  }
}
