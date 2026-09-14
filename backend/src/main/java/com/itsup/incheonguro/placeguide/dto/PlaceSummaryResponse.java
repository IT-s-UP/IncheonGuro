package com.itsup.incheonguro.placeguide.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.itsup.incheonguro.placeguide.entity.District;
import com.itsup.incheonguro.placeguide.entity.PlaceCategory;
import lombok.Getter;

// 장소 목록 / 필터 / 북마크 / 내주변 탭 조회에서 사용하는 응답
@Getter
public class PlaceSummaryResponse {

  private String placeId;
  private String title;
  private String subtitle;
  private District district;
  private PlaceCategory category;
  private double latitude;
  private double longitude;

  // 대표 이미지 URL (목록 카드에 썸네일로 표시) - 없는 장소도 많아서 빈 문자열일 수 있음
  private String imageUrl;

  // Service에서 이미 조립된 값들로 직접 생성할 때 사용 (getBookmarkedPlaces, getNearbyPlaces 등)
  public PlaceSummaryResponse(String placeId, String title, String subtitle,
      District district, PlaceCategory category, double latitude, double longitude, String imageUrl) {
    this.placeId = placeId;
    this.title = title;
    this.subtitle = subtitle;
    this.district = district;
    this.category = category;
    this.latitude = latitude;
    this.longitude = longitude;
    this.imageUrl = imageUrl;
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
        item.path("mapy").asDouble(),
        item.path("mapx").asDouble(),
        item.path("firstimage").asText("")); // 없으면 빈 문자열
  }
}
