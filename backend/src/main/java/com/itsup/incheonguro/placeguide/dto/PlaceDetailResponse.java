package com.itsup.incheonguro.placeguide.dto;

import com.itsup.incheonguro.placeguide.entity.District;
import com.itsup.incheonguro.placeguide.entity.PlaceCategory;
import lombok.Getter;

import java.util.List;

// 장소 상세 조회에서 사용하는 응답
@Getter
public class PlaceDetailResponse {

  // 한국관광공사 콘텐츠 고유번호 (contentId)
  private String placeId;

  // 장소 이름
  private String title;

  // 장소 주소
  private String subtitle;

  // 장소 소개글
  private String description;

  // 장소가 속한 구
  private District district;

  // 장소 유형
  private PlaceCategory category;

  // 로그인한 사용자가 이 장소를 북마크했는지? (로그인X -> 항상 false)
  private boolean isBookmarked;

  // 소분류명(lclsSystm3)을 태그처럼 사용
  private List<String> tags;

  public PlaceDetailResponse(String placeId, String title, String subtitle, String description,
      District district, PlaceCategory category, boolean isBookmarked, List<String> tags) {
    this.placeId = placeId;
    this.title = title;
    this.subtitle = subtitle;
    this.description = description;
    this.district = district;
    this.category = category;
    this.isBookmarked = isBookmarked;
    this.tags = tags;
  }
}
