package com.itsup.incheonguro.courseguide.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.itsup.incheonguro.courseguide.entity.TransportMode;
import lombok.Getter;

/**
 * 경로 하나에 들어가는 노드(칸) 하나를 표현하는 클래스 응답
 *
 * "장소 -> 이동정보 -> 장소 -> 이동정보 -> ..." 순서로 나열되는 코스를
 * 이 클래스 하나로 "장소" 칸과 "이동정보" 칸을 둘 다 표현
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
public class RouteNodeResponse {

  private String type;
  private String label;
  private String name;
  private String address;
  private String mode;
  private String distance;
  private String duration;

  // 장소(place) 노드 생성. 관광공사 API 기반으로 바뀌면서 CoursePlace 엔티티 대신
  // 이름/주소 문자열을 직접 받도록 변경함 (정거장 = 우리 DB에 없는 데이터라서)
  public static RouteNodeResponse ofPlace(String name, String address, String label) {
    return new RouteNodeResponse("place", label, name, address, null, null, null);
  }

  // 카카오맵 경로 조회 API 실시간 결과로 segment 노드 생성
  public static RouteNodeResponse ofLiveSegment(TransportMode mode, int distanceMeters, int durationSeconds) {
    return new RouteNodeResponse("segment", null, null, null,
        toModeLabel(mode), formatDistance(distanceMeters), formatDuration(durationSeconds));
  }

  // 좌표 누락 / API 실패 시 "정보 없음"으로 채우는 segment 노드 생성
  public static RouteNodeResponse ofUnavailableSegment(TransportMode mode) {
    return new RouteNodeResponse("segment", null, null, null,
        toModeLabel(mode), "정보 없음", "정보 없음");
  }

  private RouteNodeResponse(String type, String label, String name, String address,
      String mode, String distance, String duration) {
    this.type = type;
    this.label = label;
    this.name = name;
    this.address = address;
    this.mode = mode;
    this.distance = distance;
    this.duration = duration;
  }

  private static String toModeLabel(TransportMode transportMode) {
    return switch (transportMode) {
      case WALK -> "도보";
      case TRANSIT -> "대중교통";
      case BIKE -> "자전거";
      case CAR -> "자차";
    };
  }

  private static String formatDistance(int meters) {
    if (meters >= 1000) {
      return String.format("%.1fkm", meters / 1000.0);
    }
    return meters + "m";
  }

  private static String formatDuration(int seconds) {
    int minutes = Math.max(1, Math.round(seconds / 60f));
    return minutes + "분";
  }
}
