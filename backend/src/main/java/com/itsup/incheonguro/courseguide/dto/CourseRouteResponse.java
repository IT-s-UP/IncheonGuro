package com.itsup.incheonguro.courseguide.dto;

import java.util.List;

// 코스 하나 + 이동수단 하나에 대한 전체 경로 조회 결과
public record CourseRouteResponse(
    int totalDistanceMeters,
    int totalDurationSeconds,
    List<RouteSegmentResponse> segments) {
}
