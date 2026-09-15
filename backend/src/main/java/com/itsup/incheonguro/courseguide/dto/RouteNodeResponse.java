package com.itsup.incheonguro.courseguide.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.itsup.incheonguro.courseguide.entity.TransportMode;
import lombok.Getter;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
public class RouteNodeResponse {

  private String type;
  private String label;
  private String name;
  private String address;
  private Double latitude; // 신규 - place 노드에서 지도 마커 찍는 용도
  private Double longitude; // 신규
  private String mode;
  private String distance;
  private String duration;

  // 장소(place) 노드 생성 - 지도 마커용 좌표 추가
  public static RouteNodeResponse ofPlace(String name, String address, String label,
      Double latitude, Double longitude) {
    return new RouteNodeResponse("place", label, name, address, latitude, longitude,
        null, null, null);
  }

  public static RouteNodeResponse ofLiveSegment(TransportMode mode, int distanceMeters, int durationSeconds) {
    return new RouteNodeResponse("segment", null, null, null, null, null,
        toModeLabel(mode), formatDistance(distanceMeters), formatDuration(durationSeconds));
  }

  public static RouteNodeResponse ofUnavailableSegment(TransportMode mode) {
    return new RouteNodeResponse("segment", null, null, null, null, null,
        toModeLabel(mode), "정보 없음", "정보 없음");
  }

  private RouteNodeResponse(String type, String label, String name, String address,
      Double latitude, Double longitude, String mode, String distance, String duration) {
    this.type = type;
    this.label = label;
    this.name = name;
    this.address = address;
    this.latitude = latitude;
    this.longitude = longitude;
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
