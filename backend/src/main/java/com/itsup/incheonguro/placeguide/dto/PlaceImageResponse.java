package com.itsup.incheonguro.placeguide.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Getter;

// 장소 상세 이미지 목록 조회에서 사용하는 응답
@Getter
public class PlaceImageResponse {

  // 이미지가 저장된 실제 주소 (관광공사 detailImage2 응답의 원본 이미지 URL)
  private String imageUrl;

  private PlaceImageResponse(String imageUrl) {
    this.imageUrl = imageUrl;
  }

  // 관광공사 detailImage2 API 응답의 item 하나를 받아서 이미지 URL만 뽑아냄
  public static PlaceImageResponse from(JsonNode item) {
    return new PlaceImageResponse(item.path("originimgurl").asText());
  }
}
