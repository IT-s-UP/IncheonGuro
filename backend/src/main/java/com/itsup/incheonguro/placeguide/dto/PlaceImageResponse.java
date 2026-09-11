package com.itsup.incheonguro.placeguide.dto;

import com.itsup.incheonguro.placeguide.entity.PlaceImage;
import lombok.Getter;

// 장소 상세 이미지 목록 조회에서 사용하는 응답
@Getter
public class PlaceImageResponse {

  // 이미지 고유 번호
  private Long imageId;

  // 이미지가 저장된 실제 주소(URL)
  private String imageUrl;

  public PlaceImageResponse(PlaceImage placeImage) {
    this.imageId = placeImage.getId();
    this.imageUrl = placeImage.getImageUrl();
  }
}
