package com.itsup.incheonguro.placeguide.dto;

import com.itsup.incheonguro.placeguide.entity.Place;
import lombok.Getter;

// 장소 목록 / 필터 / 북마크 탭 조회에서 사용하는 응답
@Getter
public class PlaceSummaryResponse {

  // 장소 고유 번호
  private Long placeId;

  // 장소 이름
  private String title;

  // 장소 주소
  private String subtitle;

  // Place 엔티티 하나를 받아서, 그 안의 값을 꺼내 위 3개 필드에 옮겨 담는 생성자
  public PlaceSummaryResponse(Place place) {
    this.placeId = place.getId();
    this.title = place.getTitle();
    this.subtitle = place.getSubtitle();
  }
}
