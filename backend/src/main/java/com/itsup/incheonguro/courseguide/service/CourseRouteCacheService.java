package com.itsup.incheonguro.courseguide.service;

import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.itsup.incheonguro.courseguide.dto.CourseRouteResponse;
import com.itsup.incheonguro.courseguide.entity.TransportMode;
import com.itsup.incheonguro.courseguide.service.CourseRouteAssembler.CoursePlacePoint;

@Service
public class CourseRouteCacheService {

  private final CourseRouteAssembler courseRouteAssembler;

  public CourseRouteCacheService(CourseRouteAssembler courseRouteAssembler) {
    this.courseRouteAssembler = courseRouteAssembler;
  }

  // courseId가 우리 DB PK(Long)에서 관광공사 contentId(String)로 바뀜
  @Cacheable(value = "courseRoutes", key = "#courseId + '_' + #mode")
  public CourseRouteResponse getRoute(String courseId, TransportMode mode, List<CoursePlacePoint> places) {
    return courseRouteAssembler.getRoute(places, mode);
  }
}
