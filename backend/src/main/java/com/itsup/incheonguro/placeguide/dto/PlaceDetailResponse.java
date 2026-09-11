package com.itsup.incheonguro.placeguide.dto;

import lombok.Getter;
import java.util.List;

// 장소 상세 조회에서 사용하는 응답
@Getter
public class PlaceDetailResponse {

  // 장소 고유 번호
  private Long placeId;

  // 장소 이름
  private String title;

  // 장소 주소
  private String subtitle;

  // 장소 소개글 (긴 설명 텍스트)
  private String description;

  // 로그인한 사용자가 이 장소를 북마크했는지?
  private boolean isBookmarked;

  // 태그 이름 목록
  private List<String> tags;

  public PlaceDetailResponse(Long placeId, String title, String subtitle, String description,
      boolean isBookmarked, List<String> tags) {
    this.placeId = placeId;
    this.title = title;
    this.subtitle = subtitle;
    this.description = description;
    this.isBookmarked = isBookmarked;
    this.tags = tags;
  }
}
