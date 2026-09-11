package com.itsup.incheonguro.courseguide.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.itsup.incheonguro.courseguide.entity.CoursePlace;
import com.itsup.incheonguro.courseguide.entity.CourseSegment;
import lombok.Getter;

/**
 * 경로 하나에 들어가는 노드(칸) 하나를 표현하는 클래스 응답
 *
 * "장소 -> 이동정보 -> 장소 -> 이동정보 -> ..." 순서로 나열되는 코스를
 * 이 클래스 하나로 "장소" 칸과 "이동정보" 칸을 둘 다 표현
 *
 * - type = "place" : 장소 칸
 * label/name/address만 값이 채워지고, mode/distance/duration은 사용X (null)
 * - type = "segment" : 이동정보(경로) 칸
 * mode/distance/duration만 값이 채워지고, label/name/address는 사용X (null)
 *
 * 값이 null인 필드는 @JsonInclude 설정 덕분에 실제 응답 JSON에서는 아예 보이지 않는다.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
public class RouteNodeResponse {

  // 장소인지 이동정보인지 구분하는 값 ("place" 또는 "segment")
  private String type;

  // place 전용 - 장소
  // 장소 라벨 ex) "출발지", "경유지1", "도착지"
  private String label;
  // 장소 이름
  private String name;
  // 장소 주소
  private String address;

  // segment 전용 - 이동 구간
  // 이동수단 종류 ex) 도보, 대중교통, 자전거, 자차
  private String mode;
  // 이동 거리
  private String distance;
  // 이동 소요시간
  private String duration;

  // 장소(place) 노드를 만드는 생성자
  // CoursePlace(장소 정보)와 라벨(출발지/경유지/도착지) 정보를 받아서 place 전용 값만 채운 객체 생성
  // 아래 null인 3개의 값은 장소 노드에서는 사용X
  public static RouteNodeResponse ofPlace(CoursePlace place, String label) {
    return new RouteNodeResponse(
        "place",
        label,
        place.getName(),
        place.getAddress(),
        null, null, null);
  }

  // 이동구간(segment) 노드를 만드는 생성자
  // CourseSegment(이동정보)를 받아서 segment 전용 값만 채운 객체 생성
  // 아래 null인 3개의 값은 이동 구간 노드에서는 사용X
  public static RouteNodeResponse ofSegment(CourseSegment segment) {
    return new RouteNodeResponse(
        "segment",
        null, null, null,
        toModeLabel(segment.getTransportMode()),
        segment.getDistance(),
        segment.getDuration());
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

  // 화면에 보여줄 한글 이름으로 바꿔주는 메서드
  private static String toModeLabel(com.itsup.incheonguro.courseguide.entity.TransportMode transportMode) {
    return switch (transportMode) {
      case WALK -> "도보";
      case TRANSIT -> "대중교통";
      case BIKE -> "자전거";
      case CAR -> "자차";
    };
  }
}
