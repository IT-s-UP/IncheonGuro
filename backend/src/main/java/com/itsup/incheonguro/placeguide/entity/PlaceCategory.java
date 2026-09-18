package com.itsup.incheonguro.placeguide.entity;

import java.util.List;

// 장소 유형을 나타내는 enum
public enum PlaceCategory {
  ATTRACTION, RESTAURANT, LODGING, SHOPPING;

  // 한국관광공사 API의 contentTypeId(관광타입)를 보고 우리 카테고리로 판별
  // contentTypeId: 12(관광지) 14(문화시설) 15(축제) 25(여행코스) 28(레포츠) 32(숙박) 38(쇼핑) 39(음식점, 카페 포함)
  public static PlaceCategory fromApiCode(String contentTypeId, String lclsSystm2) {
    return switch (contentTypeId) {
      case "12", "14", "15", "25", "28" -> ATTRACTION;
      case "32" -> LODGING;
      case "38" -> SHOPPING;
      case "39" -> RESTAURANT;
      default -> null;
    };
  }

  // 우리 카테고리로 필터링할 때, API에 물어봐야 할 contentTypeId 목록을 반환
  public List<String> toContentTypeIds() {
    return switch (this) {
      case ATTRACTION -> List.of("12", "14", "15", "25", "28");
      case LODGING -> List.of("32");
      case SHOPPING -> List.of("38");
      case RESTAURANT -> List.of("39");
    };
  }
}
