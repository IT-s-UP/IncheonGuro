package com.itsup.incheonguro.placeguide.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.itsup.incheonguro.placeguide.entity.District;
import com.itsup.incheonguro.placeguide.entity.PlaceCategory;
import lombok.Getter;

// 장소 목록 / 필터 / 북마크 / 내주변 탭 조회에서 사용하는 응답
@Getter
public class PlaceSummaryResponse {

  // 한국관광공사 콘텐츠 고유번호 (contentId)
  private String placeId;

  // 장소 이름
  private String title;
  // 주소
  private String subtitle;

  // 장소가 속한 구
  private District district;

  // 장소가 속한 유형
  private PlaceCategory category;

  // GPS 위도(latitude) - 카카오맵에 마커 찍을 때 사용
  private double latitude;

  // GPS 경도(longitude) - 카카오맵에 마커 찍을 때 사용
  private double longitude;

  // Service에서 이미 조립된 값들로 직접 생성할 때 사용 (getBookmarkedPlaces, getNearbyPlaces 등)
  public PlaceSummaryResponse(String placeId, String title, String subtitle,
      District district, PlaceCategory category, double latitude, double longitude) {
    this.placeId = placeId;
    this.title = title;
    this.subtitle = subtitle;
    this.district = district;
    this.category = category;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  // 관광공사 API 응답의 item 하나(JsonNode)를 받아서 우리 DTO로 변환
  public static PlaceSummaryResponse from(JsonNode item) {
    String contentTypeId = item.path("contenttypeid").asText();
    String lclsSystm2 = item.path("lclsSystm2").asText();
    String signguCd = item.path("lDongSignguCd").asText();

    return new PlaceSummaryResponse(
        item.path("contentid").asText(),
        item.path("title").asText(),
        item.path("addr1").asText(),
        District.fromSignguCd(signguCd),
        PlaceCategory.fromApiCode(contentTypeId, lclsSystm2),
        item.path("mapy").asDouble(), // 관광공사 API에서 mapy = 위도
        item.path("mapx").asDouble()); // 관광공사 API에서 mapx = 경도
  }
}
