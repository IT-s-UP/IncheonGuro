package com.itsup.incheonguro.courseguide.dto;

import java.util.List;

// 코스 경로 조회 결과 중, 구간 하나(장소 A -> 장소 B)를 가공한 DTO
public record RouteSegmentResponse(
        String fromPlaceName,
        String toPlaceName,
        String stepType, // WALK / BIKE / BUS / SUBWAY / BUS_AND_SUBWAY / CAR
        int distanceMeters,
        int durationSeconds,
        List<double[]> pathPoints, // 지도 위 폴리라인용 좌표 목록, [x(경도), y(위도)] 쌍. 자동차는 아직 빈 리스트
        boolean available // 이 구간 조회가 성공했는지? false면 distance/duration은 0으로 무시
) {
}
