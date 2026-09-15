package com.itsup.incheonguro.courseguide.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.itsup.incheonguro.courseguide.dto.CourseRouteResponse;
import com.itsup.incheonguro.courseguide.dto.RouteSegmentResponse;
import com.itsup.incheonguro.courseguide.entity.TransportMode;
import com.itsup.incheonguro.courseguide.service.KakaoRouteFetcher.RouteResult;

import lombok.extern.slf4j.Slf4j;

// 코스의 장소 목록(순서대로)과 이동수단을 받아서, KakaoRouteFetcher로 구간별 경로를 조립하는 서비스
@Slf4j
@Service
public class CourseRouteAssembler {

  private final KakaoRouteFetcher kakaoRouteFetcher;

  public CourseRouteAssembler(KakaoRouteFetcher kakaoRouteFetcher) {
    this.kakaoRouteFetcher = kakaoRouteFetcher;
  }

  public CourseRouteResponse getRoute(List<CoursePlacePoint> places, TransportMode mode) {
    if (places.size() < 2) {
      throw new IllegalArgumentException("경로를 계산하려면 장소가 2개 이상 필요합니다.");
    }

    return switch (mode) {
      case WALK -> buildWalkOrBikeRoute(places, kakaoRouteFetcher::callWalkLegs);
      case BIKE -> buildWalkOrBikeRoute(places, kakaoRouteFetcher::callBicycleLegs);
      case TRANSIT -> buildPairwiseRoute(places, "TRANSIT", kakaoRouteFetcher::callTransit);
      case CAR -> buildPairwiseRoute(places, "CAR", kakaoRouteFetcher::callCar);
    };
  }

  // ===== 도보 / 자전거 =====
  // 경유지(via)를 지원하므로, 장소가 7개(출발+경유5+도착)를 넘으면 청크 단위로 나눠서 호출 후 이어붙임
  private CourseRouteResponse buildWalkOrBikeRoute(
      List<CoursePlacePoint> places,
      java.util.function.Function<List<double[]>, List<RouteResult>> apiCall) {

    List<RouteSegmentResponse> allSegments = new ArrayList<>();
    int totalDistance = 0;
    int totalTime = 0;

    int chunkStart = 0;
    while (chunkStart < places.size() - 1) {
      int chunkEnd = Math.min(chunkStart + 6, places.size() - 1); // 한 번에 최대 7개 지점(인덱스차 6)
      List<CoursePlacePoint> chunk = places.subList(chunkStart, chunkEnd + 1);

      List<double[]> coords = chunk.stream()
          .map(p -> new double[] { p.longitude(), p.latitude() })
          .toList();

      try {
        List<RouteResult> legs = apiCall.apply(coords);
        for (int i = 0; i < legs.size(); i++) {
          RouteResult leg = legs.get(i);
          CoursePlacePoint from = chunk.get(i);
          CoursePlacePoint to = chunk.get(i + 1);

          allSegments.add(new RouteSegmentResponse(
              from.name(), to.name(), "WALK", leg.distanceMeters(), leg.durationSeconds(),
              leg.pathPoints(), true));

          totalDistance += leg.distanceMeters();
          totalTime += leg.durationSeconds();
        }
      } catch (ResponseStatusException | IllegalArgumentException e) {
        // 이 청크 전체가 실패하면, 청크 안의 모든 구간을 실패 처리하고 다음 청크는 계속 시도
        log.warn("도보/자전거 경로 조회 실패: chunk={}, reason={}", chunk, e.getMessage());
        for (int i = 0; i < chunk.size() - 1; i++) {
          allSegments.add(new RouteSegmentResponse(
              chunk.get(i).name(), chunk.get(i + 1).name(), "WALK", 0, 0, List.of(), false));
        }
      }

      chunkStart = chunkEnd;
    }

    return new CourseRouteResponse(totalDistance, totalTime, allSegments);
  }

  // ===== 대중교통 / 자동차 =====
  // 둘 다 경유지 미지원이라 인접한 두 장소씩 순차 호출. 구간 하나 실패해도 나머지는 계속 조회
  private CourseRouteResponse buildPairwiseRoute(
      List<CoursePlacePoint> places,
      String stepType,
      java.util.function.BiFunction<double[], double[], RouteResult> apiCall) {

    List<RouteSegmentResponse> segments = new ArrayList<>();
    int totalDistance = 0;
    int totalTime = 0;

    for (int i = 0; i < places.size() - 1; i++) {
      CoursePlacePoint from = places.get(i);
      CoursePlacePoint to = places.get(i + 1);

      try {
        RouteResult result = apiCall.apply(
            new double[] { from.longitude(), from.latitude() },
            new double[] { to.longitude(), to.latitude() });

        segments.add(new RouteSegmentResponse(
            from.name(), to.name(), stepType, result.distanceMeters(), result.durationSeconds(),
            result.pathPoints(), true));

        totalDistance += result.distanceMeters();
        totalTime += result.durationSeconds();
      } catch (ResponseStatusException | IllegalArgumentException e) {
        // 자동차는 카카오모빌리티 승인 전까지 여기서 항상 실패함 -> 정상적인 동작, 구간별로 "정보 없음" 처리됨
        log.warn("{} 경로 조회 실패: {} -> {}, reason={}", stepType, from.name(), to.name(), e.getMessage());
        segments.add(new RouteSegmentResponse(from.name(), to.name(), stepType, 0, 0, List.of(), false));
      }
    }

    return new CourseRouteResponse(totalDistance, totalTime, segments);
  }

  // 장소 이름 + 좌표만 담는 단순 record
  public record CoursePlacePoint(String name, double longitude, double latitude) {
  }
}
